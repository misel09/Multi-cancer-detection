from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.model_version import ModelVersion
from app.models.user import User

router = APIRouter(prefix="/api/model", tags=["model"])


@router.get("/info")
def model_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return info about the currently active model version."""
    active = (
        db.query(ModelVersion).filter(ModelVersion.is_active == True).first()  # noqa: E712
    )
    if active:
        return {
            "version_tag": active.version_tag,
            "architecture": active.architecture,
            "description": active.description,
            "accuracy": active.accuracy,
            "created_at": active.created_at.isoformat(),
        }

    # Fallback if no DB record yet
    return {
        "version_tag": "sample-v1",
        "architecture": "MobileNetV2-Demo (Grad-CAM placeholder)",
        "description": "Sample model using deterministic class selection + MobileNetV2 Grad-CAM visuals.",
        "accuracy": None,
        "note": "Replace ml/inference/model_service.py with your real EfficientNetB3 model.",
    }
