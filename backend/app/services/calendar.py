"""Calendar event application service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domain.enums.calendar_event import CalendarEventCategory, CalendarEventType
from app.models.calendar_event import CalendarEvent
from app.models.user import User
from app.repositories.calendar import CalendarRepository
from app.repositories.subject import SubjectRepository
from app.schemas.calendar import CalendarEventCreate, CalendarEventRead, CalendarEventUpdate
from app.schemas.common import PaginatedResponse
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)


class CalendarService:
    """CRUD use-cases for student calendar events."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.events = CalendarRepository(session)
        self.subjects = SubjectRepository(session)
        self.students = StudentService(session)

    async def list_events(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        subject_id: uuid.UUID | None = None,
        event_type: CalendarEventType | None = None,
        category: CalendarEventCategory | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
    ) -> PaginatedResponse[CalendarEventRead]:
        """List calendar events for the current student."""
        student = await self.students.require_student_for_user(user)
        rows, total = await self.events.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            subject_id=subject_id,
            event_type=event_type,
            category=category,
            from_dt=from_dt,
            to_dt=to_dt,
        )
        items = [self._to_read(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_event(self, user: User, event_id: uuid.UUID) -> CalendarEventRead:
        """Fetch a single calendar event owned by the current student."""
        student = await self.students.require_student_for_user(user)
        event = await self.events.get_active_by_id(event_id, student_id=student.id)
        if event is None:
            raise NotFoundError("Calendar event not found", code="calendar_event_not_found")
        return self._to_read(event)

    async def create_event(
        self, user: User, payload: CalendarEventCreate
    ) -> CalendarEventRead:
        """Create a calendar event for the current student."""
        student = await self.students.require_student_for_user(user)

        if payload.subject_id is not None:
            subject = await self.subjects.get_active_by_id(
                payload.subject_id, student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        data = payload.model_dump()
        event = CalendarEvent(student_id=student.id, **data)
        created = await self.events.add(event)
        await self.session.commit()
        created = await self.events.get_active_by_id(created.id, student_id=student.id)
        assert created is not None
        logger.info("Created calendar event id=%s student_id=%s", created.id, student.id)
        return self._to_read(created)

    async def update_event(
        self,
        user: User,
        event_id: uuid.UUID,
        payload: CalendarEventUpdate,
    ) -> CalendarEventRead:
        """Update a calendar event owned by the current student."""
        student = await self.students.require_student_for_user(user)
        event = await self.events.get_active_by_id(event_id, student_id=student.id)
        if event is None:
            raise NotFoundError("Calendar event not found", code="calendar_event_not_found")

        data = payload.model_dump(exclude_unset=True)

        if "subject_id" in data and data["subject_id"] is not None:
            subject = await self.subjects.get_active_by_id(
                data["subject_id"], student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        for field, value in data.items():
            setattr(event, field, value)

        await self.session.commit()
        refreshed = await self.events.get_active_by_id(event.id, student_id=student.id)
        assert refreshed is not None
        logger.info("Updated calendar event id=%s", refreshed.id)
        return self._to_read(refreshed)

    async def delete_event(self, user: User, event_id: uuid.UUID) -> None:
        """Soft-delete a calendar event owned by the current student."""
        student = await self.students.require_student_for_user(user)
        event = await self.events.get_active_by_id(event_id, student_id=student.id)
        if event is None:
            raise NotFoundError("Calendar event not found", code="calendar_event_not_found")

        event.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted calendar event id=%s", event_id)

    @staticmethod
    def _to_read(e: CalendarEvent) -> CalendarEventRead:
        subject = e.subject
        return CalendarEventRead(
            id=e.id,
            student_id=e.student_id,
            subject_id=e.subject_id,
            title=e.title,
            description=e.description,
            event_type=e.event_type,
            category=e.category,
            start_datetime=e.start_datetime,
            end_datetime=e.end_datetime,
            location=e.location,
            color=e.color,
            is_all_day=e.is_all_day,
            subject_code=subject.code if subject is not None else None,
            subject_name=subject.name if subject is not None else None,
            created_at=e.created_at,
            updated_at=e.updated_at,
        )


def get_calendar_service(session: AsyncSession) -> CalendarService:
    """Factory for FastAPI dependencies."""
    return CalendarService(session)
