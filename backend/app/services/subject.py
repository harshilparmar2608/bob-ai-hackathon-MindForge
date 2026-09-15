"""Subject application service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.user import User
from app.repositories.subject import SubjectRepository
from app.schemas.common import PaginatedResponse
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)


class SubjectService:
    """CRUD use-cases for a student's subjects."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.subjects = SubjectRepository(session)
        self.students = StudentService(session)

    async def list_subjects(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        semester: str | None = None,
        search: str | None = None,
    ) -> PaginatedResponse[SubjectRead]:
        """List subjects for the current student with pagination/filters."""
        student = await self.students.require_student_for_user(user)
        rows, total = await self.subjects.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            semester=semester,
            search=search,
        )
        items = [SubjectRead.model_validate(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_subject(self, user: User, subject_id: uuid.UUID) -> SubjectRead:
        """Fetch a single subject owned by the current student."""
        student = await self.students.require_student_for_user(user)
        subject = await self.subjects.get_active_by_id(subject_id, student_id=student.id)
        if subject is None:
            raise NotFoundError("Subject not found", code="subject_not_found")
        return SubjectRead.model_validate(subject)

    async def create_subject(self, user: User, payload: SubjectCreate) -> SubjectRead:
        """Create a subject for the current student."""
        student = await self.students.require_student_for_user(user)
        if await self.subjects.code_exists(student.id, payload.code):
            raise ConflictError(
                "A subject with this code already exists",
                code="subject_code_taken",
            )

        from app.models.subject import Subject

        subject = Subject(
            student_id=student.id,
            **payload.model_dump(),
        )
        created = await self.subjects.add(subject)
        await self.session.commit()
        await self.session.refresh(created)
        logger.info(
            "Created subject student_id=%s subject_id=%s code=%s",
            student.id,
            created.id,
            created.code,
        )
        return SubjectRead.model_validate(created)

    async def update_subject(
        self,
        user: User,
        subject_id: uuid.UUID,
        payload: SubjectUpdate,
    ) -> SubjectRead:
        """Update a subject owned by the current student."""
        student = await self.students.require_student_for_user(user)
        subject = await self.subjects.get_active_by_id(subject_id, student_id=student.id)
        if subject is None:
            raise NotFoundError("Subject not found", code="subject_not_found")

        data = payload.model_dump(exclude_unset=True)
        if "code" in data and data["code"] is not None:
            if await self.subjects.code_exists(
                student.id,
                data["code"],
                exclude_id=subject.id,
            ):
                raise ConflictError(
                    "A subject with this code already exists",
                    code="subject_code_taken",
                )

        for field, value in data.items():
            setattr(subject, field, value)

        await self.session.commit()
        await self.session.refresh(subject)
        logger.info("Updated subject subject_id=%s", subject.id)
        return SubjectRead.model_validate(subject)

    async def delete_subject(self, user: User, subject_id: uuid.UUID) -> None:
        """Soft-delete a subject owned by the current student."""
        student = await self.students.require_student_for_user(user)
        subject = await self.subjects.get_active_by_id(subject_id, student_id=student.id)
        if subject is None:
            raise NotFoundError("Subject not found", code="subject_not_found")

        subject.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted subject subject_id=%s", subject.id)


def get_subject_service(session: AsyncSession) -> SubjectService:
    """Factory for FastAPI dependencies."""
    return SubjectService(session)
