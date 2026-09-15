"""Note application service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.note import Note
from app.models.user import User
from app.repositories.note import NoteRepository
from app.repositories.subject import SubjectRepository
from app.schemas.common import PaginatedResponse
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)


class NoteService:
    """CRUD use-cases for student notes."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.notes = NoteRepository(session)
        self.subjects = SubjectRepository(session)
        self.students = StudentService(session)

    async def list_notes(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        subject_id: uuid.UUID | None = None,
        search: str | None = None,
        pinned_only: bool = False,
    ) -> PaginatedResponse[NoteRead]:
        """List notes for the current student."""
        student = await self.students.require_student_for_user(user)
        rows, total = await self.notes.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            subject_id=subject_id,
            search=search,
            pinned_only=pinned_only,
        )
        items = [self._to_read(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_note(self, user: User, note_id: uuid.UUID) -> NoteRead:
        """Fetch a single note owned by the current student."""
        student = await self.students.require_student_for_user(user)
        note = await self.notes.get_active_by_id(note_id, student_id=student.id)
        if note is None:
            raise NotFoundError("Note not found", code="note_not_found")
        return self._to_read(note)

    async def create_note(self, user: User, payload: NoteCreate) -> NoteRead:
        """Create a note for the current student."""
        student = await self.students.require_student_for_user(user)

        if payload.subject_id is not None:
            subject = await self.subjects.get_active_by_id(
                payload.subject_id, student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        data = payload.model_dump()
        note = Note(student_id=student.id, **data)
        created = await self.notes.add(note)
        await self.session.commit()
        created = await self.notes.get_active_by_id(created.id, student_id=student.id)
        assert created is not None
        logger.info("Created note id=%s student_id=%s", created.id, student.id)
        return self._to_read(created)

    async def update_note(
        self,
        user: User,
        note_id: uuid.UUID,
        payload: NoteUpdate,
    ) -> NoteRead:
        """Update a note owned by the current student."""
        student = await self.students.require_student_for_user(user)
        note = await self.notes.get_active_by_id(note_id, student_id=student.id)
        if note is None:
            raise NotFoundError("Note not found", code="note_not_found")

        data = payload.model_dump(exclude_unset=True)

        if "subject_id" in data and data["subject_id"] is not None:
            subject = await self.subjects.get_active_by_id(
                data["subject_id"], student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        for field, value in data.items():
            setattr(note, field, value)

        await self.session.commit()
        refreshed = await self.notes.get_active_by_id(note.id, student_id=student.id)
        assert refreshed is not None
        logger.info("Updated note id=%s", refreshed.id)
        return self._to_read(refreshed)

    async def delete_note(self, user: User, note_id: uuid.UUID) -> None:
        """Soft-delete a note owned by the current student."""
        student = await self.students.require_student_for_user(user)
        note = await self.notes.get_active_by_id(note_id, student_id=student.id)
        if note is None:
            raise NotFoundError("Note not found", code="note_not_found")

        note.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted note id=%s", note_id)

    @staticmethod
    def _to_read(n: Note) -> NoteRead:
        subject = n.subject
        return NoteRead(
            id=n.id,
            student_id=n.student_id,
            subject_id=n.subject_id,
            title=n.title,
            content=n.content,
            tags=n.tags,
            is_pinned=n.is_pinned,
            subject_code=subject.code if subject is not None else None,
            subject_name=subject.name if subject is not None else None,
            created_at=n.created_at,
            updated_at=n.updated_at,
        )


def get_note_service(session: AsyncSession) -> NoteService:
    """Factory for FastAPI dependencies."""
    return NoteService(session)
