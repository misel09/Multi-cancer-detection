from pydantic import BaseModel
from typing import Optional


class UserAdminItem(BaseModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    phone: Optional[str] = None
    specialty: Optional[str] = None
    avatar_color: Optional[str] = "#7c6af5"
    created_at: str
    prediction_count: int = 0

    model_config = {"from_attributes": True}


class UpdateUserRoleRequest(BaseModel):
    role: str  # "user" | "admin"


class UpdateUserActiveRequest(BaseModel):
    is_active: bool


class AdminStats(BaseModel):
    total_users: int
    total_predictions: int
    pending_reviews: int
    average_confidence: float
    active_users: int
