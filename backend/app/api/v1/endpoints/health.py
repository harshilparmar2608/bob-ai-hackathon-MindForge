"""Health check endpoint."""

from __future__ import annotations

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.core.config import settings
from app.db.init_db import check_database_connection

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    """Liveness / readiness payload."""

    status: str
    app: str
    version: str
    database: str


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service health check",
)
async def health_check() -> HealthResponse:
    """Return process liveness and database connectivity status."""
    db_ok = await check_database_connection()
    return HealthResponse(
        status="ok" if db_ok else "degraded",
        app=settings.app_name,
        version=settings.app_version,
        database="up" if db_ok else "down",
    )
