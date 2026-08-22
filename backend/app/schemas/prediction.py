from datetime import datetime
from pydantic import BaseModel


class PredictionResponse(BaseModel):
    id: int
    user_id: int
    image_path: str
    image_filename: str | None
    cancer_group: str
    cancer_subtype: str
    confidence: float
    gradcam_path: str | None
    model_version: str
    status: str
    doctor_comments: str | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PredictionListItem(BaseModel):
    id: int
    cancer_group: str
    cancer_subtype: str
    confidence: float
    model_version: str
    status: str
    doctor_comments: str | None
    created_at: datetime
    image_filename: str | None

    model_config = {"from_attributes": True}


class PredictionUpdateStatusRequest(BaseModel):
    status: str
    doctor_comments: str | None = None
