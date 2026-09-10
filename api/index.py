import sys
import os

# Add the backend directory to Python path so Vercel can find the FastAPI app.
# __file__ is /api/index.py, so ../backend resolves to /backend/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app  # noqa: F401 — Vercel's ASGI handler picks up this `app` object
