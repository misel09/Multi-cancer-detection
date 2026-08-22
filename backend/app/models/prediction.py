from datetime import datetime
from sqlalchemy import String, DateTime, Float, Integer, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Image storage
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    image_filename: Mapped[str] = mapped_column(String(255), nullable=True)

    # ML output
    cancer_group: Mapped[str] = mapped_column(String(100), nullable=False)
    cancer_subtype: Mapped[str] = mapped_column(String(150), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    gradcam_path: Mapped[str] = mapped_column(String(500), nullable=True)

    # Meta
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    doctor_comments: Mapped[str] = mapped_column(Text, nullable=True)
    model_version: Mapped[str] = mapped_column(String(50), default="sample-v1")
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="predictions")
