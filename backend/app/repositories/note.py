"""Note repository."""

from __future__ import annotations

import uuid

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.note import Note
from app.repositories.base import BaseRepository


class NoteRepository(BaseRepository[Note]):
    """Data access for student notes."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Note)

    async def get_active_by_id(
        self,
        note_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> Note | None:
        """Return a non-deleted note, optionally scoped to a student."""
        stmt = (
            select(Note)
            .where(
                Note.id == note_id,
                Note.deleted_at.is_(None),
            )
            .options(selectinload(Note.subject))
        )
        if student_id is not None:
            stmt = stmt.where(Note.student_id == student_id)
        return await self.session.scalar(stmt)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        subject_id: uuid.UUID | None = None,
        search: str | None = None,
        pinned_only: bool = False,
    ) -> tuple[list[Note], int]:
        """Return paginated notes with optional filters."""
        filters = [
            Note.student_id == student_id,
            Note.deleted_at.is_(None),
        ]
        if subject_id is not None:
            filters.append(Note.subject_id == subject_id)
        if pinned_only:
            filters.append(Note.is_pinned.is_(True))
        if search:
            pattern = f"%{search.strip()}%"
            filters.append(
                or_(
                    Note.title.ilike(pattern),
                    Note.content.ilike(pattern),
                    Note.tags.ilike(pattern),
                )
            )

        count_stmt = select(func.count()).select_from(Note).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(Note)
            .where(*filters)
            .options(selectinload(Note.subject))
            .order_by(Note.is_pinned.desc(), Note.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total
