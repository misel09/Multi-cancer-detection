"""
Profile router — view and update authenticated user's own profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.schemas.profile import ChangePasswordRequest, ProfileResponse, UpdateProfileRequest
from app.services.auth_service import hash_password, verify_password

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return ProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        phone=current_user.phone,
        specialty=current_user.specialty,
        avatar_color=current_user.avatar_color or "#7c6af5",
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat(),
    )


@router.patch("", response_model=ProfileResponse)
def update_profile(
    payload: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        current_user.name = payload.name
    if payload.phone is not None:
        current_user.phone = payload.phone
    if payload.specialty is not None:
        current_user.specialty = payload.specialty
    if payload.avatar_color is not None:
        current_user.avatar_color = payload.avatar_color
    db.commit()
    db.refresh(current_user)
    return ProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        phone=current_user.phone,
        specialty=current_user.specialty,
        avatar_color=current_user.avatar_color or "#7c6af5",
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat(),
    )


@router.patch("/password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters",
        )
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
