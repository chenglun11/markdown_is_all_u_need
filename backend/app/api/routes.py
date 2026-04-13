import io
import ipaddress
import math
import os
import uuid
import zipfile
from pathlib import Path
from urllib.parse import urlparse

import aiofiles
import anyio
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.converter import ConversionError, UnsupportedFormatError, converter
from app.db.database import get_db
from app.db.models import ConversionHistory
from app.models.schemas import (
    BatchConversionResponse,
    BatchDownloadRequest,
    ConversionResult,
    ConversionSummary,
    ErrorResponse,
    HistoryListResponse,
    SupportedFormatsResponse,
    URLConvertRequest,
)

router = APIRouter()


# ── Helpers ─────────────────────────────────────────────────────


def _validate_extension(filename: str) -> str:
    """Validate file extension against whitelist. Returns the extension."""
    ext = Path(filename or "file").suffix.lower()
    if ext not in settings.SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: '{ext}'. "
                   f"Supported: {', '.join(settings.SUPPORTED_EXTENSIONS)}",
        )
    return ext


def _validate_url(url: str) -> None:
    """Validate URL to prevent SSRF attacks."""
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname or ""
        # Block private/internal addresses
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1", ""):
            raise HTTPException(status_code=400, detail="Internal URLs are not allowed")
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_link_local:
                raise HTTPException(status_code=400, detail="Internal/private IP addresses are not allowed")
        except ValueError:
            # hostname is not an IP, that's fine
            pass
        if parsed.scheme not in ("http", "https"):
            raise HTTPException(status_code=400, detail="Only http/https URLs are allowed")
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL format")


async def _save_upload(upload: UploadFile) -> Path:
    """Save an uploaded file to the uploads directory and return its path."""
    # Validate extension BEFORE saving to disk
    _validate_extension(upload.filename or "file")

    ext = Path(upload.filename or "file").suffix
    unique_name = f"{uuid.uuid4().hex}{ext}"
    dest = settings.UPLOAD_DIR / unique_name

    content = await upload.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File '{upload.filename}' exceeds the maximum size of "
                   f"{settings.MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )

    # Use aiofiles to avoid blocking the event loop
    async with aiofiles.open(dest, "wb") as f:
        await f.write(content)
    return dest


async def _save_output(filename: str, content: str) -> Path:
    """Save converted Markdown content to the outputs directory."""
    stem = Path(filename).stem
    md_name = f"{stem}_{uuid.uuid4().hex[:8]}.md"
    dest = settings.OUTPUT_DIR / md_name
    async with aiofiles.open(dest, "w", encoding="utf-8") as f:
        await f.write(content)
    return dest


async def _convert_and_persist(
    file_path: Path,
    original_filename: str,
    file_size: int,
    db: Session,
) -> ConversionHistory:
    """Convert a file, persist the result, and return the ORM record."""
    # Run synchronous MarkItDown conversion in a thread to avoid blocking
    result = await anyio.to_thread.run_sync(lambda: converter.convert_file(file_path))

    # Persist to database first, then save output file
    record = ConversionHistory(
        filename=original_filename,
        original_format=file_path.suffix.lower(),
        file_size=file_size,
        markdown_content=result["text_content"],
        title=result["title"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Save markdown output (non-critical, DB record is source of truth)
    try:
        await _save_output(original_filename, result["text_content"])
    except Exception:
        pass  # Output file is optional; content is in DB

    return record


# ── Routes ──────────────────────────────────────────────────────


@router.post(
    "/convert/file",
    response_model=ConversionResult,
    responses={400: {"model": ErrorResponse}, 413: {"model": ErrorResponse}},
    summary="Convert a single file to Markdown",
)
async def convert_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    saved_path = await _save_upload(file)
    try:
        record = await _convert_and_persist(
            saved_path,
            file.filename or "unknown",
            saved_path.stat().st_size,
            db,
        )
        return record
    except UnsupportedFormatError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ConversionError as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Cleanup uploaded temp file
        saved_path.unlink(missing_ok=True)


@router.post(
    "/convert/files",
    response_model=BatchConversionResponse,
    responses={400: {"model": ErrorResponse}},
    summary="Batch convert multiple files to Markdown",
)
async def convert_files(
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    if len(files) > settings.MAX_BATCH_FILES:
        raise HTTPException(
            status_code=400,
            detail=f"Too many files. Maximum is {settings.MAX_BATCH_FILES} files per batch.",
        )

    results: list[ConversionResult] = []
    errors: list[dict] = []

    for upload in files:
        try:
            saved_path = await _save_upload(upload)
            try:
                record = await _convert_and_persist(
                    saved_path,
                    upload.filename or "unknown",
                    saved_path.stat().st_size,
                    db,
                )
                results.append(ConversionResult.model_validate(record))
            finally:
                saved_path.unlink(missing_ok=True)
        except HTTPException as e:
            errors.append({"filename": upload.filename, "error": e.detail})
        except (UnsupportedFormatError, ConversionError) as e:
            errors.append({"filename": upload.filename, "error": str(e)})

    return BatchConversionResponse(results=results, errors=errors)


@router.post(
    "/convert/url",
    response_model=ConversionResult,
    responses={400: {"model": ErrorResponse}},
    summary="Convert a URL to Markdown",
)
async def convert_url(
    body: URLConvertRequest,
    db: Session = Depends(get_db),
):
    # Validate URL to prevent SSRF
    _validate_url(body.url)

    try:
        result = await anyio.to_thread.run_sync(lambda: converter.convert_url(body.url))
    except ConversionError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Save output
    url_stem = body.url.split("/")[-1][:50] or "url_page"
    await _save_output(url_stem, result["text_content"])

    record = ConversionHistory(
        filename=body.url,
        original_format="url",
        file_size=0,
        markdown_content=result["text_content"],
        title=result["title"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ── History ─────────────────────────────────────────────────────


@router.get(
    "/history",
    response_model=HistoryListResponse,
    summary="Get conversion history (paginated)",
)
async def list_history(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    total = db.query(ConversionHistory).count()
    total_pages = max(1, math.ceil(total / page_size))

    items = (
        db.query(ConversionHistory)
        .order_by(desc(ConversionHistory.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return HistoryListResponse(
        items=[ConversionSummary.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/history/{record_id}",
    response_model=ConversionResult,
    responses={404: {"model": ErrorResponse}},
    summary="Get a single history record with full Markdown content",
)
async def get_history(record_id: int, db: Session = Depends(get_db)):
    record = db.query(ConversionHistory).filter(ConversionHistory.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.delete(
    "/history/{record_id}",
    summary="Delete a history record",
    responses={404: {"model": ErrorResponse}},
)
async def delete_history(record_id: int, db: Session = Depends(get_db)):
    record = db.query(ConversionHistory).filter(ConversionHistory.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Record deleted", "id": record_id}


# ── Download ────────────────────────────────────────────────────


@router.get(
    "/download/{record_id}",
    summary="Download a single conversion result as .md file",
    responses={404: {"model": ErrorResponse}},
)
async def download_file(record_id: int, db: Session = Depends(get_db)):
    record = db.query(ConversionHistory).filter(ConversionHistory.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    stem = Path(record.filename).stem
    md_filename = f"{stem}.md"
    content = record.markdown_content.encode("utf-8")

    return StreamingResponse(
        io.BytesIO(content),
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{md_filename}"'},
    )


@router.post(
    "/download/batch",
    summary="Batch download conversion results as a ZIP file",
    responses={400: {"model": ErrorResponse}},
)
async def download_batch(
    body: BatchDownloadRequest,
    db: Session = Depends(get_db),
):
    if not body.ids:
        raise HTTPException(status_code=400, detail="No IDs provided")

    records = (
        db.query(ConversionHistory)
        .filter(ConversionHistory.id.in_(body.ids))
        .all()
    )

    if not records:
        raise HTTPException(status_code=404, detail="No records found for the given IDs")

    # Build ZIP in memory
    zip_buffer = io.BytesIO()
    used_names: set[str] = set()

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for record in records:
            stem = Path(record.filename).stem
            md_name = f"{stem}.md"

            # Handle duplicate filenames
            counter = 1
            while md_name in used_names:
                md_name = f"{stem}_{counter}.md"
                counter += 1
            used_names.add(md_name)

            zf.writestr(md_name, record.markdown_content)

    zip_buffer.seek(0)

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="markdown_files.zip"'},
    )


# ── Formats ─────────────────────────────────────────────────────


@router.get(
    "/formats",
    response_model=SupportedFormatsResponse,
    summary="List supported file formats",
)
async def list_formats():
    return SupportedFormatsResponse(
        formats=settings.SUPPORTED_FORMATS,
        all_extensions=settings.SUPPORTED_EXTENSIONS,
    )
