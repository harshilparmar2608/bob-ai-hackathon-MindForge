"""Generic async repository base."""

from __future__ import annotations

import uuid
from typing import Generic, TypeVar

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Thin async data-access layer shared by concrete repositories."""

    def __init__(self, session: AsyncSession, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    async def get_by_id(self, entity_id: uuid.UUID) -> ModelT | None:
        """Fetch a single entity by primary key."""
        return await self.session.get(self.model, entity_id)

    async def list_all(self, *, limit: int = 100, offset: int = 0) -> list[ModelT]:
        """Return a simple paginated list of entities."""
        stmt = select(self.model).offset(offset).limit(limit)
        result = await self.session.scalars(stmt)
        return list(result.all())

    async def add(self, entity: ModelT) -> ModelT:
        """Persist ``entity`` and refresh server-generated columns."""
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return entity

    async def delete(self, entity: ModelT) -> None:
        """Hard-delete ``entity`` from the session."""
        await self.session.delete(entity)
        await self.session.flush()
