import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# Load .env file if present (local dev). On Vercel, env vars are set via the dashboard.
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, SessionLocal
from app import models
from app.crud import get_user_by_email, create_user
from app.routes import auth, tickets


# ─── DB Init + Seeding ────────────────────────────────────────────────────────

def seed_demo_users(db):
    """Create demo users on first run if they don't exist."""
    demo_users = [
        {"name": "Demo User",  "email": "user@demo.com",  "password": "user123",  "role": "user"},
        {"name": "Admin User", "email": "admin@demo.com", "password": "admin123", "role": "admin"},
    ]
    for u in demo_users:
        if not get_user_by_email(db, u["email"]):
            create_user(db, name=u["name"], email=u["email"], password=u["password"], role=u["role"])
            print(f"  [OK] Seeded {u['role']}: {u['email']}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables in PostgreSQL (Supabase), seed demo data
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("[DB] Database ready. Seeding demo accounts...")
        seed_demo_users(db)
        print("[OK] Startup complete.")
    finally:
        db.close()
    yield
    # Shutdown: SQLAlchemy connection pool is cleaned up automatically


# ─── App Factory ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="CRM Ticket System API",
    description="Customer Support Ticketing CRM — Assessment MVP",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server + production origin from env
_cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_extra_origin = os.getenv("FRONTEND_ORIGIN", "")
if _extra_origin:
    _cors_origins.append(_extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tickets.router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "CRM Ticket System API is running."}
