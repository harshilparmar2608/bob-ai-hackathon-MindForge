"""Assignment application service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domain.enums.assignment_status import AssignmentStatus
from app.domain.enums.priority_level import PriorityLevel
from app.models.assignment import Assignment
from app.models.user import User
from app.repositories.assignment import AssignmentRepository
from app.repositories.subject import SubjectRepository
from app.schemas.assignment import AssignmentCreate, AssignmentRead, AssignmentUpdate
from app.schemas.common import PaginatedResponse
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)


class AssignmentService:
    """CRUD use-cases for student assignments."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.assignments = AssignmentRepository(session)
        self.subjects = SubjectRepository(session)
        self.students = StudentService(session)

    async def list_assignments(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        subject_id: uuid.UUID | None = None,
        status: AssignmentStatus | None = None,
        priority: PriorityLevel | None = None,
    ) -> PaginatedResponse[AssignmentRead]:
        """List assignments for the current student with pagination/filters."""
        student = await self.students.require_student_for_user(user)
        rows, total = await self.assignments.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            subject_id=subject_id,
            status=status,
            priority=priority,
        )
        items = [self._to_read(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_assignment(self, user: User, assignment_id: uuid.UUID) -> AssignmentRead:
        """Fetch a single assignment owned by the current student."""
        student = await self.students.require_student_for_user(user)
        assignment = await self.assignments.get_active_by_id(
            assignment_id, student_id=student.id
        )
        if assignment is None:
            raise NotFoundError("Assignment not found", code="assignment_not_found")
        return self._to_read(assignment)

    async def create_assignment(self, user: User, payload: AssignmentCreate) -> AssignmentRead:
        """Create an assignment for the current student."""
        student = await self.students.require_student_for_user(user)

        # Validate subject ownership if provided
        if payload.subject_id is not None:
            subject = await self.subjects.get_active_by_id(
                payload.subject_id, student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        data = payload.model_dump()
        assignment = Assignment(student_id=student.id, **data)
        created = await self.assignments.add(assignment)
        await self.session.commit()
        created = await self.assignments.get_active_by_id(created.id, student_id=student.id)
        assert created is not None
        logger.info("Created assignment id=%s student_id=%s", created.id, student.id)
        return self._to_read(created)

    async def update_assignment(
        self,
        user: User,
        assignment_id: uuid.UUID,
        payload: AssignmentUpdate,
    ) -> AssignmentRead:
        """Update an assignment owned by the current student."""
        student = await self.students.require_student_for_user(user)
        assignment = await self.assignments.get_active_by_id(
            assignment_id, student_id=student.id
        )
        if assignment is None:
            raise NotFoundError("Assignment not found", code="assignment_not_found")

        data = payload.model_dump(exclude_unset=True)

        # Validate new subject ownership if changing
        if "subject_id" in data and data["subject_id"] is not None:
            subject = await self.subjects.get_active_by_id(
                data["subject_id"], student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        # Track completion timestamp automatically
        if "status" in data and data["status"] == AssignmentStatus.COMPLETED:
            if assignment.completed_at is None:
                data["completed_at"] = datetime.now(timezone.utc)
        elif "status" in data and data["status"] != AssignmentStatus.COMPLETED:
            data["completed_at"] = None

        for field, value in data.items():
            setattr(assignment, field, value)

        await self.session.commit()
        refreshed = await self.assignments.get_active_by_id(
            assignment.id, student_id=student.id
        )
        assert refreshed is not None
        logger.info("Updated assignment id=%s", refreshed.id)
        return self._to_read(refreshed)

    async def delete_assignment(self, user: User, assignment_id: uuid.UUID) -> None:
        """Soft-delete an assignment owned by the current student."""
        student = await self.students.require_student_for_user(user)
        assignment = await self.assignments.get_active_by_id(
            assignment_id, student_id=student.id
        )
        if assignment is None:
            raise NotFoundError("Assignment not found", code="assignment_not_found")

        assignment.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted assignment id=%s", assignment_id)

    @staticmethod
    def _to_read(a: Assignment) -> AssignmentRead:
        subject = a.subject
        return AssignmentRead(
            id=a.id,
            student_id=a.student_id,
            subject_id=a.subject_id,
            title=a.title,
            description=a.description,
            due_date=a.due_date,
            status=a.status,
            priority=a.priority,
            grade=a.grade,
            max_grade=a.max_grade,
            completed_at=a.completed_at,
            subject_code=subject.code if subject is not None else None,
            subject_name=subject.name if subject is not None else None,
            created_at=a.created_at,
            updated_at=a.updated_at,
        )


def get_assignment_service(session: AsyncSession) -> AssignmentService:
    """Factory for FastAPI dependencies."""
    return AssignmentService(session)
