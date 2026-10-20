"""AI StudyMate Ethiopia - Main Application Entrypoint."""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: runs startup and shutdown tasks."""
    # Ensure local storage directories exist
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
    # Initialize database tables
    try:
        await init_db()
    except Exception as e:
        print(f"Database initialization notice: {e}")
    yield
    # Shutdown cleanups can be added here


# Initialize FastAPI instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=__version__,
    description=(
        "Production-oriented, multilingual educational technology SaaS API "
        "designed for Ethiopian university and college students."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", summary="Root Welcome Endpoint")
async def root():
    """Welcome endpoint providing product metadata and links to docs."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": __version__,
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR,
        "supported_languages": ["en", "am", "om"],
    }
