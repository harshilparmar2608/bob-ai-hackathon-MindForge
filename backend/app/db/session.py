"""Async SQLAlchemy engine, session factory, and FastAPI dependency."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.core.config import settings


def _build_engine() -> AsyncEngine:
    """
    Create the process-wide async engine.

    - SQLite (dev): ``sqlite+aiosqlite://...`` with ``NullPool``
    - PostgreSQL (prod): ``postgresql+asyncpg://...`` with connection pooling
    """
    url = settings.database_url
    echo = settings.database_echo

    if settings.is_sqlite:
        return create_async_engine(
            url,
            echo=echo,
            poolclass=NullPool,
            connect_args={"check_same_thread": False},
        )

    return create_async_engine(
        url,
        echo=echo,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_pre_ping=settings.database_pool_pre_ping,
    )


engine: AsyncEngine = _build_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield a request-scoped async database session.

    Does **not** auto-commit — services own transaction boundaries via
    ``await session.commit()``. Rolls back on unhandled errors; the session
    is always closed by the context manager.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


DbSession = Annotated[AsyncSession, Depends(get_db)]
