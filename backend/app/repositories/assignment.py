"""Assignment repository."""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.enums.assignment_status import AssignmentStatus
from app.domain.enums.priority_level import PriorityLevel
from app.models.assignment import Assignment
from app.repositories.base import BaseRepository


class AssignmentRepository(BaseRepository[Assignment]):
    """Data access for student assignments."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Assignment)

    async def get_active_by_id(
        self,
        assignment_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> Assignment | None:
        """Return a non-deleted assignment, optionally scoped to a student."""
        stmt = (
            select(Assignment)
            .where(
                Assignment.id == assignment_id,
                Assignment.deleted_at.is_(None),
            )
            .options(selectinload(Assignment.subject))
        )
        if student_id is not None:
            stmt = stmt.where(Assignment.student_id == student_id)
        return await self.session.scalar(stmt)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        subject_id: uuid.UUID | None = None,
        status: AssignmentStatus | None = None,
        priority: PriorityLevel | None = None,
        due_before: date | None = None,
        due_after: date | None = None,
    ) -> tuple[list[Assignment], int]:
        """Return paginated assignments with optional filters."""
        filters = [
            Assignment.student_id == student_id,
            Assignment.deleted_at.is_(None),
        ]
        if subject_id is not None:
            filters.append(Assignment.subject_id == subject_id)
        if status is not None:
            filters.append(Assignment.status == status)
        if priority is not None:
            filters.append(Assignment.priority == priority)
        if due_before is not None:
            filters.append(Assignment.due_date <= due_before)
        if due_after is not None:
            filters.append(Assignment.due_date >= due_after)

        count_stmt = select(func.count()).select_from(Assignment).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(Assignment)
            .where(*filters)
            .options(selectinload(Assignment.subject))
            .order_by(Assignment.due_date.asc().nulls_last(), Assignment.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total
