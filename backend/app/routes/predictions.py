from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.prediction import PredictionListItem, PredictionResponse, PredictionUpdateStatusRequest
from app.services import prediction_service
from app.utils.image_utils import validate_image

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_analyze(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload an image and run cancer classification + Grad-CAM."""
    validate_image(file)
    image_bytes = await file.read()

    prediction = prediction_service.create_prediction(
        db=db,
        user_id=current_user.id,
        image_bytes=image_bytes,
        filename=file.filename or "upload.jpg",
    )
    return prediction


@router.get("", response_model=list[PredictionListItem])
def list_predictions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return paginated list of the current user's predictions."""
    return prediction_service.list_predictions(db, current_user.id, skip=skip, limit=limit)


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pred = prediction_service.get_prediction(db, prediction_id, current_user.id)
    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return pred


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = prediction_service.delete_prediction(db, prediction_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")


@router.patch("/{prediction_id}/status", response_model=PredictionResponse)
def update_status(
    prediction_id: int,
    payload: PredictionUpdateStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pred = prediction_service.update_prediction_status(
        db, prediction_id, current_user.id, payload.status, payload.doctor_comments
    )
    if not pred:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found")
    return pred
