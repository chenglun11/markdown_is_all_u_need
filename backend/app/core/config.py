import os
from pathlib import Path


class Settings:
    """Application settings."""

    APP_TITLE: str = "MarkItDown Converter API"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Convert various file formats to Markdown using MarkItDown"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'app.db'}"

    # File storage
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    OUTPUT_DIR: Path = BASE_DIR / "outputs"

    # Upload limits
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100 MB
    MAX_BATCH_FILES: int = 20

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Supported formats
    SUPPORTED_EXTENSIONS: list[str] = [
        ".pdf", ".docx", ".pptx", ".xlsx", ".xls",
        ".html", ".htm", ".csv", ".json", ".xml",
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp",
        ".wav", ".mp3",
        ".zip",
        ".msg", ".eml",
        ".md", ".txt", ".rtf",
        ".ipynb",
    ]

    SUPPORTED_FORMATS: dict[str, list[str]] = {
        "Documents": [".pdf", ".docx", ".pptx", ".xlsx", ".xls", ".rtf", ".txt", ".md"],
        "Web": [".html", ".htm", ".xml", ".json", ".csv"],
        "Images": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"],
        "Audio": [".wav", ".mp3"],
        "Archives": [".zip"],
        "Email": [".msg", ".eml"],
        "Notebooks": [".ipynb"],
    }

    def __init__(self):
        # Ensure directories exist
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        (self.BASE_DIR / "data").mkdir(parents=True, exist_ok=True)


settings = Settings()
