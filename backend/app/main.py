import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load .env file if present (local dev). On Railway/Vercel, env vars are set via the dashboard.
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import engine, SessionLocal
from app import models
from app.crud import get_user_by_email, create_user
from app.routes import auth, tickets
import traceback


# ─── DB Init + Seeding ────────────────────────────────────────────────────────

def seed_demo_users(db):
    """Create demo users on first run if they don't exist.
    
    Credentials can be overridden via environment variables for production.
    """
    demo_users = [
        {
            "name": os.getenv("DEMO_USER_NAME", "Demo User"),
            "email": os.getenv("DEMO_USER_EMAIL", "user@demo.com"),
            "password": os.getenv("DEMO_USER_PASSWORD", "user123"),
            "role": "user",
        },
        {
            "name": os.getenv("DEMO_ADMIN_NAME", "Admin User"),
            "email": os.getenv("DEMO_ADMIN_EMAIL", "admin@demo.com"),
            "password": os.getenv("DEMO_ADMIN_PASSWORD", "admin123"),
            "role": "admin",
        },
    ]
    for u in demo_users:
        if not get_user_by_email(db, u["email"]):
            create_user(db, name=u["name"], email=u["email"], password=u["password"], role=u["role"])
            print(f"  [OK] Seeded {u['role']}: {u['email']}")
        else:
            print(f"  [SKIP] Already exists: {u['email']}")


def init_db():
    """Create all tables and seed demo data. Safe to call multiple times."""
    if engine is None:
        print("[WARN] DATABASE_URL not set — skipping DB init.")
        return
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_demo_users(db)
    finally:
        db.close()


# ─── Module-level init ────────────────────────────────────────────────────────
# Running init_db() at import time guarantees tables exist and demo users are
# seeded on every cold start, before the first request is handled.
try:
    init_db()
    print("[OK] DB initialised at module load.")
except Exception as _exc:
    # Log but don't crash — the route handler will surface a proper error
    print(f"[WARN] DB init at module load failed: {_exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lifespan runs on traditional servers (uvicorn). init_db() is idempotent
    # so calling it twice is safe.
    try:
        init_db()
        print("[OK] Lifespan startup complete.")
    except Exception as e:
        print(f"[WARN] Lifespan DB init failed: {e}")
    yield
    # Shutdown: SQLAlchemy connection pool is cleaned up automatically


# ─── App Factory ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="CRM Ticket System API",
    description="Customer Support Ticketing CRM — Assessment MVP",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow Vite dev server, and any production frontend URLs from env vars.
# FRONTEND_ORIGIN can be a comma-separated list of origins.
_cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

_extra_origins_raw = os.getenv("FRONTEND_ORIGIN", "")
if _extra_origins_raw:
    for _origin in _extra_origins_raw.split(","):
        _origin = _origin.strip()
        if _origin and _origin not in _cors_origins:
            _cors_origins.append(_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global Exception Handler ────────────────────────────────────────────────
# Catches any unhandled Python exception and returns it as JSON (not plain text).
# This makes debugging 500 errors possible from the browser/API client.
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"[ERROR] Unhandled exception on {request.method} {request.url}:\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
    )

# Include routers
app.include_router(auth.router)
app.include_router(tickets.router)


@app.get("/", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "message": "CRM Ticket System API is running.",
        "db_configured": engine is not None,
    }


@app.get("/health", tags=["health"])
def health():
    """Railway health check endpoint."""
    return {"status": "healthy"}
