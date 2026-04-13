from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


# ── Request Models ──────────────────────────────────────────────


class URLConvertRequest(BaseModel):
    url: str = Field(..., description="URL to convert to Markdown")


class BatchDownloadRequest(BaseModel):
    ids: list[int] = Field(..., description="List of history record IDs to download")


# ── Response Models ─────────────────────────────────────────────


class ConversionResult(BaseModel):
    id: int
    filename: str
    original_format: str
    file_size: int
    title: str | None = None
    markdown_content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversionSummary(BaseModel):
    id: int
    filename: str
    original_format: str
    file_size: int
    title: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BatchConversionResponse(BaseModel):
    results: list[ConversionResult]
    errors: list[dict] = []


class HistoryListResponse(BaseModel):
    items: list[ConversionSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


class SupportedFormatsResponse(BaseModel):
    formats: dict[str, list[str]]
    all_extensions: list[str]


class ErrorResponse(BaseModel):
    detail: str
