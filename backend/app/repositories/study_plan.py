"""Study plan repository."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.enums.assignment_status import AssignmentStatus
from app.models.study_plan import StudyPlan
from app.repositories.base import BaseRepository


class StudyPlanRepository(BaseRepository[StudyPlan]):
    """Data access for student study plans."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, StudyPlan)

    async def get_active_by_id(
        self,
        plan_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> StudyPlan | None:
        """Return a non-deleted study plan, optionally scoped to a student."""
        stmt = (
            select(StudyPlan)
            .where(
                StudyPlan.id == plan_id,
                StudyPlan.deleted_at.is_(None),
            )
            .options(selectinload(StudyPlan.subject))
        )
        if student_id is not None:
            stmt = stmt.where(StudyPlan.student_id == student_id)
        return await self.session.scalar(stmt)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        subject_id: uuid.UUID | None = None,
        status: AssignmentStatus | None = None,
    ) -> tuple[list[StudyPlan], int]:
        """Return paginated study plans with optional filters."""
        filters = [
            StudyPlan.student_id == student_id,
            StudyPlan.deleted_at.is_(None),
        ]
        if subject_id is not None:
            filters.append(StudyPlan.subject_id == subject_id)
        if status is not None:
            filters.append(StudyPlan.status == status)

        count_stmt = select(func.count()).select_from(StudyPlan).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(StudyPlan)
            .where(*filters)
            .options(selectinload(StudyPlan.subject))
            .order_by(StudyPlan.start_date.asc().nulls_last(), StudyPlan.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total
