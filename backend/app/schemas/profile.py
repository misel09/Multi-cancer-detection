from pydantic import BaseModel
from typing import Optional


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    specialty: Optional[str] = None
    avatar_color: Optional[str] = "#7c6af5"
    is_active: bool
    created_at: str

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specialty: Optional[str] = None
    avatar_color: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
