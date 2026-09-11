import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException, status

# Supabase PostgreSQL connection string — set DATABASE_URL in your environment.
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Fix for Railway/Supabase: ensure we use the correct driver scheme.
    # Some environments provide "postgres://" instead of "postgresql://"
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    engine = create_engine(
        DATABASE_URL,
        # pool_pre_ping: validates connections before use — critical for serverless
        # where connections may have gone stale between function invocations.
        pool_pre_ping=True,
        # pool_recycle: recycle connections every 5 minutes to avoid timeout errors
        # from Supabase's connection limits.
        pool_recycle=300,
        # Keep pool size small for Railway's connection limits
        pool_size=5,
        max_overflow=10,
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    # DATABASE_URL not set — create placeholder so import succeeds.
    # Any actual DB call will raise a 503 error instead of crashing at startup.
    engine = None
    SessionLocal = None


Base = declarative_base()


def get_db():
    """FastAPI dependency that provides a database session."""
    if SessionLocal is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not configured. Set DATABASE_URL environment variable.",
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
