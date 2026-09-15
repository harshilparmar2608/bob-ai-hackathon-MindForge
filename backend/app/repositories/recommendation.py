"""Recommendation repository."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums.priority_level import PriorityLevel
from app.models.recommendation import Recommendation
from app.repositories.base import BaseRepository


class RecommendationRepository(BaseRepository[Recommendation]):
    """Data access for student recommendations."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Recommendation)

    async def get_active_by_id(
        self,
        rec_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> Recommendation | None:
        """Return a non-deleted recommendation, optionally scoped to a student."""
        stmt = select(Recommendation).where(
            Recommendation.id == rec_id,
            Recommendation.deleted_at.is_(None),
        )
        if student_id is not None:
            stmt = stmt.where(Recommendation.student_id == student_id)
        return await self.session.scalar(stmt)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        category: str | None = None,
        priority: PriorityLevel | None = None,
        unread_only: bool = False,
    ) -> tuple[list[Recommendation], int]:
        """Return paginated recommendations with optional filters."""
        filters = [
            Recommendation.student_id == student_id,
            Recommendation.deleted_at.is_(None),
            Recommendation.is_dismissed.is_(False),
        ]
        if category is not None:
            filters.append(Recommendation.category == category)
        if priority is not None:
            filters.append(Recommendation.priority == priority)
        if unread_only:
            filters.append(Recommendation.is_read.is_(False))

        count_stmt = select(func.count()).select_from(Recommendation).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(Recommendation)
            .where(*filters)
            .order_by(Recommendation.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total
