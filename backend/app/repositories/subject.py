"""Subject repository."""

from __future__ import annotations

import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subject import Subject
from app.repositories.base import BaseRepository


class SubjectRepository(BaseRepository[Subject]):
    """Data access for student subjects/courses."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Subject)

    async def get_active_by_id(
        self,
        subject_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> Subject | None:
        """Return a non-deleted subject, optionally scoped to a student."""
        stmt = select(Subject).where(
            Subject.id == subject_id,
            Subject.deleted_at.is_(None),
        )
        if student_id is not None:
            stmt = stmt.where(Subject.student_id == student_id)
        return await self.session.scalar(stmt)

    async def code_exists(
        self,
        student_id: uuid.UUID,
        code: str,
        *,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        """Return ``True`` if the student already has this subject code."""
        stmt = (
            select(func.count())
            .select_from(Subject)
            .where(
                Subject.student_id == student_id,
                func.upper(Subject.code) == code.upper(),
                Subject.deleted_at.is_(None),
            )
        )
        if exclude_id is not None:
            stmt = stmt.where(Subject.id != exclude_id)
        count = await self.session.scalar(stmt)
        return bool(count and count > 0)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        semester: str | None = None,
        search: str | None = None,
    ) -> tuple[list[Subject], int]:
        """Return paginated subjects for a student with optional filters."""
        filters = [
            Subject.student_id == student_id,
            Subject.deleted_at.is_(None),
        ]
        if semester:
            filters.append(Subject.semester == semester)
        if search:
            pattern = f"%{search.strip()}%"
            filters.append(
                or_(
                    Subject.code.ilike(pattern),
                    Subject.name.ilike(pattern),
                    Subject.instructor_name.ilike(pattern),
                )
            )

        count_stmt = select(func.count()).select_from(Subject).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(Subject)
            .where(*filters)
            .order_by(Subject.sort_order.asc(), Subject.code.asc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total
