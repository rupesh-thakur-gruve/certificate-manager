"""
CertTrack Backend - FastAPI Application Entry Point.

Certificate Tracking & Advisory Workflow application.
"""

import sys
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from database import init_db
from database.migrations import seed_demo_users
from middleware import (
    RateLimitMiddleware,
    RequestLoggerMiddleware,
    RequestSizeLimitMiddleware,
)
from routers import (
    auth_router,
    certification_router,
    advisory_router,
    audit_router,
)

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Certificate Tracking & Advisory Workflow API",
    debug=settings.DEBUG,
)

# ========== Middleware ==========

# CORS from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Request logging
app.add_middleware(RequestLoggerMiddleware)

# Rate limiting from settings
if settings.RATE_LIMIT_ENABLED:
    app.add_middleware(
        RateLimitMiddleware,
        requests_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE,
    )

# File size limit from settings
app.add_middleware(
    RequestSizeLimitMiddleware,
    max_size=settings.max_upload_size_bytes,
)

# ========== Routers ==========

app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(certification_router, prefix="/certs", tags=["Certifications"])
app.include_router(advisory_router, prefix="/advisory", tags=["AI Advisory"])
app.include_router(audit_router, prefix="/audit", tags=["Audit Logs"])

# ========== Static Files ==========

# Create uploads directory if it doesn't exist
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# ========== Startup Events ==========


@app.on_event("startup")
async def startup():
    """Initialize database and seed demo users on startup."""
    init_db()
    seed_demo_users()


# ========== Health Check ==========


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }


@app.get("/")
async def root():
    """Root endpoint with API info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }
