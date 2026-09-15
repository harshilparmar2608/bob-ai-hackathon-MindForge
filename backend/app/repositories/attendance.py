"""Attendance repository."""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.enums.attendance_status import AttendanceStatus
from app.models.attendance import Attendance
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    """Data access for attendance session records."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Attendance)

    async def get_active_by_id(
        self,
        attendance_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> Attendance | None:
        """Return a non-deleted attendance row, optionally scoped to a student."""
        stmt = (
            select(Attendance)
            .where(
                Attendance.id == attendance_id,
                Attendance.deleted_at.is_(None),
            )
            .options(selectinload(Attendance.subject))
        )
        if student_id is not None:
            stmt = stmt.where(Attendance.student_id == student_id)
        return await self.session.scalar(stmt)

    async def session_exists(
        self,
        *,
        student_id: uuid.UUID,
        subject_id: uuid.UUID,
        session_date: date,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        """Return ``True`` if a session already exists for that day/subject."""
        stmt = (
            select(func.count())
            .select_from(Attendance)
            .where(
                Attendance.student_id == student_id,
                Attendance.subject_id == subject_id,
                Attendance.session_date == session_date,
                Attendance.deleted_at.is_(None),
            )
        )
        if exclude_id is not None:
            stmt = stmt.where(Attendance.id != exclude_id)
        count = await self.session.scalar(stmt)
        return bool(count and count > 0)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        subject_id: uuid.UUID | None = None,
        status: AttendanceStatus | None = None,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> tuple[list[Attendance], int]:
        """Return paginated attendance rows with optional filters."""
        filters = [
            Attendance.student_id == student_id,
            Attendance.deleted_at.is_(None),
        ]
        if subject_id is not None:
            filters.append(Attendance.subject_id == subject_id)
        if status is not None:
            filters.append(Attendance.status == status)
        if date_from is not None:
            filters.append(Attendance.session_date >= date_from)
        if date_to is not None:
            filters.append(Attendance.session_date <= date_to)

        count_stmt = select(func.count()).select_from(Attendance).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(Attendance)
            .where(*filters)
            .options(selectinload(Attendance.subject))
            .order_by(Attendance.session_date.desc(), Attendance.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total

    async def list_by_subject(
        self,
        *,
        student_id: uuid.UUID,
        subject_id: uuid.UUID,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[list[Attendance], int]:
        """Return paginated attendance for one subject."""
        return await self.list_for_student(
            student_id,
            offset=offset,
            limit=limit,
            subject_id=subject_id,
        )

    async def count_by_status(
        self,
        *,
        student_id: uuid.UUID,
        subject_id: uuid.UUID,
    ) -> dict[AttendanceStatus, int]:
        """Aggregate status counts for a student's subject."""
        stmt = (
            select(Attendance.status, func.count())
            .where(
                Attendance.student_id == student_id,
                Attendance.subject_id == subject_id,
                Attendance.deleted_at.is_(None),
            )
            .group_by(Attendance.status)
        )
        rows = (await self.session.execute(stmt)).all()
        counts: dict[AttendanceStatus, int] = {status: 0 for status in AttendanceStatus}
        for status, count in rows:
            counts[status] = int(count)
        return counts
