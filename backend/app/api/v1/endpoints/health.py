"""System Health & Diagnostics Endpoints."""

import os
from datetime import datetime, timezone
from fastapi import APIRouter
from app import __version__
from app.core.config import settings
from app.core.database import check_database_connection
from app.schemas.health import HealthResponse, DatabaseHealth, StorageHealth

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Comprehensive system health check",
    description="Inspects backend service status, database connectivity, and local storage access.",
)
async def get_health() -> HealthResponse:
    # 1. Database inspection
    db_status = await check_database_connection()

    # 2. Storage inspection
    storage_accessible = os.path.isdir(settings.LOCAL_STORAGE_PATH) or os.path.exists(settings.LOCAL_STORAGE_PATH)
    if not storage_accessible:
        try:
            os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
            storage_accessible = True
        except Exception:
            storage_accessible = False

    return HealthResponse(
        status="online" if db_status["connected"] else "degraded",
        project_name=settings.PROJECT_NAME,
        version=__version__,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        database=DatabaseHealth(
            connected=db_status["connected"],
            latency_ms=db_status["latency_ms"],
            error=db_status["error"],
        ),
        storage=StorageHealth(
            storage_type=settings.STORAGE_TYPE,
            target_path=settings.LOCAL_STORAGE_PATH,
            accessible=storage_accessible,
        ),
        supported_languages=["en", "am", "om"],
        ai_provider=settings.AI_PROVIDER,
    )


@router.get(
    "/health/ping",
    summary="Lightweight Liveness Probe",
    description="Returns immediate 200 OK for load balancers and container probes.",
)
async def ping():
    return {
        "status": "ok",
        "message": "pong",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
