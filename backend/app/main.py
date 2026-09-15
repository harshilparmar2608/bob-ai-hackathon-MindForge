"""CampusPilot FastAPI application entrypoint."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import get_logger, setup_logging
from app.db.init_db import dispose_engine, init_db, seed_dev_data
from app.middleware.error_handler import register_exception_handlers

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Application startup / shutdown hooks."""
    setup_logging()
    # Ensure ORM models are registered on Base.metadata.
    import app.models  # noqa: F401

    if settings.is_development or settings.app_env == "test":
        await init_db(create_tables=True)
        logger.info("Database initialized (create_tables=True)")
        await seed_dev_data()
    else:
        await init_db(create_tables=False)
        logger.info("Database connectivity verified")

    yield
    await dispose_engine()
    logger.info("Application shutdown complete")


def create_app() -> FastAPI:
    """Application factory."""
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.app_debug,
        lifespan=lifespan,
        description=(
            "CampusPilot academic copilot API.\n\n"
            "## Modules\n"
            "- **Authentication** — register, login, refresh, current user\n"
            "- **Student** — academic profile\n"
            "- **Subjects** — enrolled courses\n"
            "- **Attendance** — class session tracking and summaries\n\n"
            "All academic endpoints require a Bearer access token."
        ),
        contact={"name": "CampusPilot Team"},
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
        openapi_tags=[
            {
                "name": "Authentication",
                "description": "JWT registration, login, refresh, and identity",
            },
            {
                "name": "Student",
                "description": "Academic profile for the authenticated user",
            },
            {
                "name": "Subjects",
                "description": "Course/subject CRUD for the current student",
            },
            {
                "name": "Attendance",
                "description": "Attendance sessions, filters, and subject summaries",
            },
            {
                "name": "Assignments",
                "description": "Academic assignments CRUD with status and priority tracking",
            },
            {
                "name": "Notes",
                "description": "Study notes with optional subject linkage and pinning",
            },
            {
                "name": "Study Plans",
                "description": "Structured study sessions with time tracking",
            },
            {
                "name": "Calendar",
                "description": "Academic calendar events (exams, deadlines, lectures)",
            },
            {
                "name": "Career",
                "description": "Career goals and milestones",
            },
            {
                "name": "Recommendations",
                "description": "AI and system-generated academic recommendations",
            },
            {
                "name": "Health",
                "description": "Liveness and database readiness",
            },
        ],
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(application)
    application.include_router(api_router, prefix=settings.api_v1_prefix)
    return application


app = create_app()
