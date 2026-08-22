from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config.settings import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a database session and closes it when done."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Called on FastAPI startup."""
    # Import models so SQLAlchemy registers them on Base.metadata
    import app.models.user  # noqa: F401
    import app.models.prediction  # noqa: F401
    import app.models.model_version  # noqa: F401

    Base.metadata.create_all(bind=engine)
