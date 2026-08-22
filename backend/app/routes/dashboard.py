from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.middleware.auth import get_current_user
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.dashboard import CancerGroupStat, DashboardStats, DateStat

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/statistics", response_model=DashboardStats)
def get_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregate statistics for the dashboard."""
    total_predictions = db.query(func.count(Prediction.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0

    # Predictions by cancer group
    group_rows = (
        db.query(Prediction.cancer_group, func.count(Prediction.id))
        .group_by(Prediction.cancer_group)
        .all()
    )
    predictions_by_group = [
        CancerGroupStat(cancer_group=row[0], count=row[1]) for row in group_rows
    ]

    # Average confidence
    avg_conf = db.query(func.avg(Prediction.confidence)).scalar() or 0.0

    # Last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_count = (
        db.query(func.count(Prediction.id))
        .filter(Prediction.created_at >= week_ago)
        .scalar()
        or 0
    )

    # Predictions over time (last 7 days grouped by date)
    trend_rows = (
        db.query(func.date(Prediction.created_at).label('date'), func.count(Prediction.id))
        .filter(Prediction.created_at >= week_ago)
        .group_by(func.date(Prediction.created_at))
        .order_by(func.date(Prediction.created_at))
        .all()
    )
    recent_trend = [
        DateStat(date=str(row[0]), count=row[1]) for row in trend_rows
    ]

    return DashboardStats(
        total_predictions=total_predictions,
        total_users=total_users,
        predictions_by_group=predictions_by_group,
        average_confidence=round(float(avg_conf), 4),
        recent_predictions_count=recent_count,
        recent_trend=recent_trend,
    )
