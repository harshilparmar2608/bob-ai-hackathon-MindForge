"""Attendance application service."""

from __future__ import annotations

import logging
import uuid
from datetime import date, datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, ValidationAppError
from app.domain.enums.attendance_status import AttendanceStatus
from app.models.attendance import Attendance
from app.models.user import User
from app.repositories.attendance import AttendanceRepository
from app.repositories.subject import SubjectRepository
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceRead,
    AttendanceSubjectSummary,
    AttendanceUpdate,
)
from app.schemas.common import PaginatedResponse
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)

# Below this percentage, a subject is flagged critical (matches product UX).
_CRITICAL_ATTENDANCE_THRESHOLD = 75.0


class AttendanceService:
    """CRUD and summary use-cases for attendance sessions."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.attendance = AttendanceRepository(session)
        self.subjects = SubjectRepository(session)
        self.students = StudentService(session)

    async def list_attendance(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        subject_id: uuid.UUID | None = None,
        status: AttendanceStatus | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> PaginatedResponse[AttendanceRead]:
        """List attendance sessions for the current student."""
        if date_from and date_to and date_from > date_to:
            raise ValidationAppError(
                "date_from cannot be after date_to",
                code="invalid_date_range",
            )

        student = await self.students.require_student_for_user(user)
        rows, total = await self.attendance.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            subject_id=subject_id,
            status=status,
            date_from=date_from,
            date_to=date_to,
        )
        items = [self._to_read(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_by_subject(
        self,
        user: User,
        subject_id: uuid.UUID,
        pagination: PaginationParams,
    ) -> PaginatedResponse[AttendanceRead]:
        """List attendance sessions for one subject, including ownership checks."""
        student = await self.students.require_student_for_user(user)
        subject = await self.subjects.get_active_by_id(subject_id, student_id=student.id)
        if subject is None:
            raise NotFoundError("Subject not found", code="subject_not_found")

        rows, total = await self.attendance.list_by_subject(
            student_id=student.id,
            subject_id=subject_id,
            offset=pagination.offset,
            limit=pagination.limit,
        )
        items = [self._to_read(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_subject_summary(
        self,
        user: User,
        subject_id: uuid.UUID,
    ) -> AttendanceSubjectSummary:
        """Compute rolled-up attendance stats for a subject."""
        student = await self.students.require_student_for_user(user)
        subject = await self.subjects.get_active_by_id(subject_id, student_id=student.id)
        if subject is None:
            raise NotFoundError("Subject not found", code="subject_not_found")

        counts = await self.attendance.count_by_status(
            student_id=student.id,
            subject_id=subject_id,
        )
        total = sum(counts.values())
        attended = counts[AttendanceStatus.PRESENT] + counts[AttendanceStatus.LATE]
        percentage = round((attended / total) * 100, 2) if total else 0.0

        return AttendanceSubjectSummary(
            subject_id=subject.id,
            subject_code=subject.code,
            subject_name=subject.name,
            total_sessions=total,
            present_count=counts[AttendanceStatus.PRESENT],
            absent_count=counts[AttendanceStatus.ABSENT],
            late_count=counts[AttendanceStatus.LATE],
            excused_count=counts[AttendanceStatus.EXCUSED],
            percentage=percentage,
            is_critical=bool(total and percentage < _CRITICAL_ATTENDANCE_THRESHOLD),
            color=subject.color,
        )

    async def create_attendance(
        self,
        user: User,
        payload: AttendanceCreate,
    ) -> AttendanceRead:
        """Create an attendance session for a subject owned by the student."""
        student = await self.students.require_student_for_user(user)
        subject = await self.subjects.get_active_by_id(
            payload.subject_id,
            student_id=student.id,
        )
        if subject is None:
            raise NotFoundError("Subject not found", code="subject_not_found")

        if await self.attendance.session_exists(
            student_id=student.id,
            subject_id=payload.subject_id,
            session_date=payload.session_date,
        ):
            raise ConflictError(
                "Attendance for this subject and date already exists",
                code="attendance_duplicate",
            )

        record = Attendance(
            student_id=student.id,
            subject_id=payload.subject_id,
            session_date=payload.session_date,
            status=payload.status,
            notes=payload.notes,
            recorded_by=payload.recorded_by or user.email,
        )
        created = await self.attendance.add(record)
        await self.session.commit()
        # Reload with subject relationship for response enrichment.
        created = await self.attendance.get_active_by_id(created.id, student_id=student.id)
        assert created is not None
        logger.info(
            "Created attendance id=%s subject_id=%s date=%s",
            created.id,
            created.subject_id,
            created.session_date,
        )
        return self._to_read(created)

    async def update_attendance(
        self,
        user: User,
        attendance_id: uuid.UUID,
        payload: AttendanceUpdate,
    ) -> AttendanceRead:
        """Update an attendance session owned by the current student."""
        student = await self.students.require_student_for_user(user)
        record = await self.attendance.get_active_by_id(
            attendance_id,
            student_id=student.id,
        )
        if record is None:
            raise NotFoundError("Attendance record not found", code="attendance_not_found")

        data = payload.model_dump(exclude_unset=True)
        new_date = data.get("session_date", record.session_date)
        if await self.attendance.session_exists(
            student_id=student.id,
            subject_id=record.subject_id,
            session_date=new_date,
            exclude_id=record.id,
        ):
            raise ConflictError(
                "Attendance for this subject and date already exists",
                code="attendance_duplicate",
            )

        for field, value in data.items():
            setattr(record, field, value)

        await self.session.commit()
        refreshed = await self.attendance.get_active_by_id(record.id, student_id=student.id)
        assert refreshed is not None
        logger.info("Updated attendance id=%s", refreshed.id)
        return self._to_read(refreshed)

    async def delete_attendance(self, user: User, attendance_id: uuid.UUID) -> None:
        """Soft-delete an attendance session."""
        student = await self.students.require_student_for_user(user)
        record = await self.attendance.get_active_by_id(
            attendance_id,
            student_id=student.id,
        )
        if record is None:
            raise NotFoundError("Attendance record not found", code="attendance_not_found")

        record.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted attendance id=%s", attendance_id)

    @staticmethod
    def _to_read(record: Attendance) -> AttendanceRead:
        subject = record.subject
        return AttendanceRead(
            id=record.id,
            student_id=record.student_id,
            subject_id=record.subject_id,
            session_date=record.session_date,
            status=record.status,
            notes=record.notes,
            recorded_by=record.recorded_by,
            subject_code=subject.code if subject is not None else None,
            subject_name=subject.name if subject is not None else None,
            created_at=record.created_at,
            updated_at=record.updated_at,
        )


def get_attendance_service(session: AsyncSession) -> AttendanceService:
    """Factory for FastAPI dependencies."""
    return AttendanceService(session)
