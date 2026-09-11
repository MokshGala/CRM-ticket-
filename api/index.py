"""
Vercel serverless entrypoint.

Adds the backend directory to sys.path so the existing `app` package
can be imported, then re-exports the FastAPI `app` object.
Vercel looks for a callable named `app` in this module.
"""
import sys
import os

# Make `import app.*` resolve to backend/app/*
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app  # noqa: E402 -- must come after sys.path manipulation
