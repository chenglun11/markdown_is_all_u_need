import os
import tempfile
from pathlib import Path

from markitdown import MarkItDown

from app.core.config import settings


class ConversionError(Exception):
    """Raised when file conversion fails."""
    pass


class UnsupportedFormatError(Exception):
    """Raised when the file format is not supported."""
    pass


class MarkItDownConverter:
    """Wrapper around MarkItDown for file conversion."""

    def __init__(self):
        self._md = MarkItDown()

    def convert_file(self, file_path: str | Path) -> dict:
        """
        Convert a file to Markdown.

        Args:
            file_path: Path to the file to convert.

        Returns:
            dict with keys: text_content, title

        Raises:
            UnsupportedFormatError: If the file extension is not supported.
            ConversionError: If conversion fails.
        """
        file_path = Path(file_path)

        # Check extension
        ext = file_path.suffix.lower()
        if ext not in settings.SUPPORTED_EXTENSIONS:
            raise UnsupportedFormatError(
                f"Unsupported file format: '{ext}'. "
                f"Supported formats: {', '.join(settings.SUPPORTED_EXTENSIONS)}"
            )

        # Check file exists
        if not file_path.exists():
            raise ConversionError(f"File not found: {file_path}")

        try:
            result = self._md.convert(str(file_path))
            return {
                "text_content": result.text_content or "",
                "title": result.title,
            }
        except Exception as e:
            raise ConversionError(f"Failed to convert file '{file_path.name}': {str(e)}")

    def convert_url(self, url: str) -> dict:
        """
        Convert a URL to Markdown.

        Args:
            url: The URL to convert.

        Returns:
            dict with keys: text_content, title

        Raises:
            ConversionError: If conversion fails.
        """
        try:
            result = self._md.convert_url(url)
            return {
                "text_content": result.text_content or "",
                "title": result.title,
            }
        except Exception as e:
            raise ConversionError(f"Failed to convert URL '{url}': {str(e)}")


# Singleton instance
converter = MarkItDownConverter()
