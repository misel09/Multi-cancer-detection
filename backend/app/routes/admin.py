"""
Admin router — user management & system stats.
Only accessible by users with role == 'admin'.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.admin import (
    AdminStats, UpdateUserActiveRequest,
    UpdateUserRoleRequest, UserAdminItem,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


@router.get("/stats", response_model=AdminStats)
def admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    pending_reviews = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.status == "PENDING")
        .scalar()
        or 0
    )
    avg_conf = db.query(func.avg(Prediction.confidence)).scalar() or 0.0

    return AdminStats(
        total_users=total_users,
        active_users=active_users,
        total_predictions=total_predictions,
        pending_reviews=pending_reviews,
        average_confidence=round(float(avg_conf), 4),
    )


@router.get("/users", response_model=list[UserAdminItem])
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        count = (
            db.query(func.count(Prediction.id))
            .filter(Prediction.user_id == u.id)
            .scalar()
            or 0
        )
        result.append(
            UserAdminItem(
                id=u.id,
                name=u.name,
                email=u.email,
                role=u.role,
                is_active=u.is_active,
                phone=u.phone,
                specialty=u.specialty,
                avatar_color=u.avatar_color or "#7c6af5",
                created_at=u.created_at.isoformat(),
                prediction_count=count,
            )
        )
    return result


@router.patch("/users/{user_id}/role", response_model=UserAdminItem)
def update_user_role(
    user_id: int,
    payload: UpdateUserRoleRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if payload.role not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    count = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.user_id == user.id)
        .scalar()
        or 0
    )
    return UserAdminItem(
        id=user.id, name=user.name, email=user.email,
        role=user.role, is_active=user.is_active,
        phone=user.phone, specialty=user.specialty,
        avatar_color=user.avatar_color or "#7c6af5",
        created_at=user.created_at.isoformat(),
        prediction_count=count,
    )


@router.patch("/users/{user_id}/active", response_model=UserAdminItem)
def update_user_active(
    user_id: int,
    payload: UpdateUserActiveRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    count = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.user_id == user.id)
        .scalar()
        or 0
    )
    return UserAdminItem(
        id=user.id, name=user.name, email=user.email,
        role=user.role, is_active=user.is_active,
        phone=user.phone, specialty=user.specialty,
        avatar_color=user.avatar_color or "#7c6af5",
        created_at=user.created_at.isoformat(),
        prediction_count=count,
    )
