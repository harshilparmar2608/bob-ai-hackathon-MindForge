"""Calendar event repository."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.enums.calendar_event import CalendarEventCategory, CalendarEventType
from app.models.calendar_event import CalendarEvent
from app.repositories.base import BaseRepository


class CalendarRepository(BaseRepository[CalendarEvent]):
    """Data access for student calendar events."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, CalendarEvent)

    async def get_active_by_id(
        self,
        event_id: uuid.UUID,
        *,
        student_id: uuid.UUID | None = None,
    ) -> CalendarEvent | None:
        """Return a non-deleted event, optionally scoped to a student."""
        stmt = (
            select(CalendarEvent)
            .where(
                CalendarEvent.id == event_id,
                CalendarEvent.deleted_at.is_(None),
            )
            .options(selectinload(CalendarEvent.subject))
        )
        if student_id is not None:
            stmt = stmt.where(CalendarEvent.student_id == student_id)
        return await self.session.scalar(stmt)

    async def list_for_student(
        self,
        student_id: uuid.UUID,
        *,
        offset: int = 0,
        limit: int = 20,
        subject_id: uuid.UUID | None = None,
        event_type: CalendarEventType | None = None,
        category: CalendarEventCategory | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
    ) -> tuple[list[CalendarEvent], int]:
        """Return paginated calendar events with optional filters."""
        filters = [
            CalendarEvent.student_id == student_id,
            CalendarEvent.deleted_at.is_(None),
        ]
        if subject_id is not None:
            filters.append(CalendarEvent.subject_id == subject_id)
        if event_type is not None:
            filters.append(CalendarEvent.event_type == event_type)
        if category is not None:
            filters.append(CalendarEvent.category == category)
        if from_dt is not None:
            filters.append(CalendarEvent.start_datetime >= from_dt)
        if to_dt is not None:
            filters.append(CalendarEvent.start_datetime <= to_dt)

        count_stmt = select(func.count()).select_from(CalendarEvent).where(*filters)
        total = int(await self.session.scalar(count_stmt) or 0)

        stmt = (
            select(CalendarEvent)
            .where(*filters)
            .options(selectinload(CalendarEvent.subject))
            .order_by(CalendarEvent.start_datetime.asc())
            .offset(offset)
            .limit(limit)
        )
        rows = list((await self.session.scalars(stmt)).all())
        return rows, total
