"""
Image utility functions — validation, saving, URL generation.
"""

import os
import uuid
from datetime import datetime

from fastapi import HTTPException, UploadFile, status

from app.config.settings import settings

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}


def validate_image(file: UploadFile) -> None:
    """Raise HTTPException if the file is not a valid image or too large."""
    # Check content type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: JPEG, PNG, WEBP.",
        )

    # Check extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"File extension '{ext}' not allowed.",
        )


def save_upload(image_bytes: bytes, filename: str, subdir: str = "") -> str:
    """
    Save bytes to the local uploads directory.

    Returns:
        Relative path from the project root (e.g. 'uploads/originals/abc.jpg').
    """
    # Check size
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB} MB.",
        )

    # Build destination directory
    dest_dir = settings.UPLOAD_DIR
    if subdir:
        dest_dir = os.path.join(dest_dir, subdir)
    os.makedirs(dest_dir, exist_ok=True)

    # Unique filename to avoid collisions
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    uid = uuid.uuid4().hex[:8]
    ext = os.path.splitext(filename)[1].lower() or ".png"
    safe_name = f"{ts}_{uid}{ext}"

    dest_path = os.path.join(dest_dir, safe_name)
    with open(dest_path, "wb") as f:
        f.write(image_bytes)

    return dest_path


def get_image_url(file_path: str, base_url: str = "") -> str:
    """Convert a local file path to a URL-friendly path."""
    # Normalize separators
    url_path = file_path.replace("\\", "/")
    return f"{base_url}/{url_path}"
