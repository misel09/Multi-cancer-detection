from pydantic import BaseModel


class CancerGroupStat(BaseModel):
    cancer_group: str
    count: int


class DateStat(BaseModel):
    date: str
    count: int


class DashboardStats(BaseModel):
    total_predictions: int
    total_users: int
    predictions_by_group: list[CancerGroupStat]
    average_confidence: float
    recent_predictions_count: int  # last 7 days
    recent_trend: list[DateStat]
