"""Database bootstrap helpers (create/drop metadata, connectivity checks)."""

from __future__ import annotations

import logging

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Development seed configuration
# ---------------------------------------------------------------------------
# These credentials are used ONLY in development/test environments to create
# an initial user so that Swagger / the frontend login work out of the box.
# They are never written to production databases.
_SEED_USER_EMAIL = "alex.rivera@techford.edu"
_SEED_USER_PASSWORD = "password123"
_SEED_USER_FULL_NAME = "Alex Rivera"


async def check_database_connection(db_engine: AsyncEngine | None = None) -> bool:
    """Return ``True`` when a simple ``SELECT 1`` succeeds against the engine."""
    target = db_engine or engine
    try:
        async with target.connect() as connection:
            await connection.execute(text("SELECT 1"))
        return True
    except Exception:
        logger.exception("Database connectivity check failed")
        return False


async def init_db(*, create_tables: bool = False) -> None:
    """
    Prepare the database for application startup.

    Parameters
    ----------
    create_tables:
        When ``True``, runs ``Base.metadata.create_all``. Prefer Alembic
        migrations in non-trivial environments; this flag is intended for
        local/dev smoke tests before models and revisions exist.
    """
    import app.models  # noqa: F401 — register metadata

    ok = await check_database_connection()
    if not ok:
        raise RuntimeError("Unable to connect to the database")

    if create_tables:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)
        logger.info("Database tables created via metadata.create_all")


async def seed_dev_data() -> None:
    """
    Ensure the development demo user exists in the database.

    Idempotent — safe to call on every startup. Skips creation when the
    user already exists so repeated restarts don't cause ``UNIQUE`` errors.

    Only call this in ``development`` / ``test`` environments.
    """
    # Import here to avoid circular imports at module load time.
    from app.core.security import hash_password
    from app.domain.enums.user_role import UserRole
    from app.repositories.user import UserRepository

    async with AsyncSessionLocal() as session:
        repo = UserRepository(session)

        already_exists = await repo.email_exists(_SEED_USER_EMAIL)
        if already_exists:
            logger.info(
                "Seed user already present — skipping creation",
                extra={"email": _SEED_USER_EMAIL},
            )
            return

        logger.info(
            "Creating development seed user",
            extra={"email": _SEED_USER_EMAIL},
        )
        hashed = hash_password(_SEED_USER_PASSWORD)
        user = await repo.create_user(
            email=_SEED_USER_EMAIL,
            hashed_password=hashed,
            full_name=_SEED_USER_FULL_NAME,
            role=UserRole.STUDENT,
        )
        await session.commit()
        await session.refresh(user)
        logger.info(
            "Seed user created successfully",
            extra={"email": _SEED_USER_EMAIL, "user_id": str(user.id)},
        )


async def drop_db() -> None:
    """
    Drop all tables registered on ``Base.metadata``.

    Intended for test teardown only — never call in production.
    """
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
    logger.warning("Database tables dropped via metadata.drop_all")


async def dispose_engine() -> None:
    """Dispose the global async engine (call on application shutdown)."""
    await engine.dispose()
    logger.info("Database engine disposed")


async def get_session() -> AsyncSession:
    """
    Create a standalone session outside of FastAPI request scope.

    Caller is responsible for commit/rollback/close.
    Prefer ``get_db`` inside HTTP handlers.
    """
    return AsyncSessionLocal()
