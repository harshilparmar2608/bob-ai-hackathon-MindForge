"""Career goal repository."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.career import CareerGoal
from app.repositories.base import BaseRepository


class CareerRepository(BaseRepository[CareerGoal]):
    """Data access for student career goals."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CareerGoal)

    async def get_active_by_id(
        self,
        goal_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> CareerGoal | None:
        """Return a non-deleted career goal, optionally scoped to a student."""
        stmt = select(CareerGoal).where(
            CareerGoal.id == goal_id,
            CareerGoal.deleted_at.is_(None),
        )
        if student_id is not None:
            stmt = stmt.where(CareerGoal.student_id == student_id)
        return await self.session.scalar(stmt)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        category: str | None = None,
        achieved: bool | None = None,
    ) -> tuple[list[CareerGoal], int]:
        """Return paginated career goals with optional filters."""
        filters = [
            CareerGoal.student_id == student_id,
            CareerGoal.deleted_at.is_(None),
        ]
        if category is not None:
            filters.append(CareerGoal.category == category)
        if achieved is not None:
            filters.append(CareerGoal.is_achieved.is_(achieved))

        count_stmt = select(func.count()).select_from(CareerGoal).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(CareerGoal)
            .where(*filters)
            .order_by(CareerGoal.target_date.asc().nulls_last(), CareerGoal.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total
