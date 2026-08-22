"""
Prediction service — orchestrates upload → model inference → DB save.
"""

import base64
import os
from datetime import datetime

from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models.prediction import Prediction
from app.services.model_service_client import run_inference
from app.utils.image_utils import save_upload


def create_prediction(
    db: Session,
    user_id: int,
    image_bytes: bytes,
    filename: str,
) -> Prediction:
    """
    Full pipeline:
      1. Save image to local uploads/ folder
      2. Run ML inference (fake class + real Grad-CAM)
      3. Save Grad-CAM overlay image
      4. Persist Prediction row to DB
      5. Return the ORM object
    """
    # 1. Save original image
    image_path = save_upload(image_bytes, filename, subdir="originals")

    # 2. Run inference
    result = run_inference(image_bytes)

    # 3. Save Grad-CAM overlay (base64 → file)
    gradcam_path: str | None = None
    gradcam_b64: str = result.get("gradcam_base64", "")
    if gradcam_b64:
        gradcam_bytes = base64.b64decode(gradcam_b64)
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
        gc_filename = f"gradcam_{ts}.png"
        gradcam_path = save_upload(gradcam_bytes, gc_filename, subdir="gradcam")

    # 4. Persist to DB
    prediction = Prediction(
        user_id=user_id,
        image_path=image_path,
        image_filename=filename,
        cancer_group=result["cancer_group"],
        cancer_subtype=result["cancer_subtype"],
        confidence=result["confidence"],
        gradcam_path=gradcam_path,
        model_version="sample-v1",
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    return prediction


def list_predictions(db: Session, user_id: int, skip: int = 0, limit: int = 50):
    return (
        db.query(Prediction)
        .filter(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_prediction(db: Session, prediction_id: int, user_id: int) -> Prediction | None:
    return (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id, Prediction.user_id == user_id)
        .first()
    )


def delete_prediction(db: Session, prediction_id: int, user_id: int) -> bool:
    pred = get_prediction(db, prediction_id, user_id)
    if not pred:
        return False
    db.delete(pred)
    db.commit()
    return True


def update_prediction_status(
    db: Session,
    prediction_id: int,
    user_id: int,
    status: str,
    doctor_comments: str | None,
) -> Prediction | None:
    pred = get_prediction(db, prediction_id, user_id)
    if not pred:
        return None
    
    pred.status = status
    if doctor_comments is not None:
        pred.doctor_comments = doctor_comments
        
    db.commit()
    db.refresh(pred)
    return pred
