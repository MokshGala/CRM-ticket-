"""
Standalone seed script — creates tables and inserts demo users.

Usage (from project root):
    DATABASE_URL="postgresql://..." python scripts/seed.py

Or with a .env file in backend/:
    cd backend && python ..\scripts\seed.py

The script is idempotent: it skips users that already exist.
It uses the existing crud helpers and models without modifying them.
"""
import sys
import os

# Allow running from project root or backend/
_here = os.path.dirname(os.path.abspath(__file__))
_backend = os.path.join(_here, "..", "backend")
sys.path.insert(0, _backend)

# Load backend/.env if present (local dev convenience)
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_backend, ".env"))
except ImportError:
    pass  # python-dotenv not installed — rely on env var being set externally

from app.database import engine, SessionLocal
from app import models
from app.crud import get_user_by_email, create_user

DEMO_USERS = [
    {
        "name": "Demo User",
        "email": "user@demo.com",
        "password": "user123",
        "role": "user",
    },
    {
        "name": "Admin User",
        "email": "admin@demo.com",
        "password": "admin123",
        "role": "admin",
    },
]


def main():
    if engine is None:
        print("[ERROR] DATABASE_URL is not set. Export it before running this script.")
        sys.exit(1)

    print("[INFO] Creating tables (if they don't exist)...")
    models.Base.metadata.create_all(bind=engine)
    print("[OK]   Tables ready.")

    db = SessionLocal()
    try:
        for u in DEMO_USERS:
            if get_user_by_email(db, u["email"]):
                print(f"[SKIP] {u['role']} already exists: {u['email']}")
            else:
                create_user(db, name=u["name"], email=u["email"],
                            password=u["password"], role=u["role"])
                print(f"[OK]   Seeded {u['role']}: {u['email']}  /  password: {u['password']}")
    finally:
        db.close()

    print("\nDone. Credentials:")
    for u in DEMO_USERS:
        print(f"  {u['role']:6s}  {u['email']}  /  {u['password']}")


if __name__ == "__main__":
    main()
