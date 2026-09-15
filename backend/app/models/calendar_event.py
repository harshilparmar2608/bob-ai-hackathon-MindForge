"""Calendar event ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column
from app.domain.enums.calendar_event import CalendarEventCategory, CalendarEventType

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.subject import Subject


class CalendarEvent(Base, TimestampMixin, SoftDeleteMixin):
    """
    Scheduled academic calendar event for a student.

    Relationships:
    - ``Student`` 1:N ``CalendarEvent``
    - ``Subject`` 1:N ``CalendarEvent`` (optional)
    """

    __tablename__ = "calendar_events"

    id: Mapped[uuid.UUID] = uuid_pk_column()
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subjects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    event_type: Mapped[CalendarEventType] = mapped_column(
        Enum(
            CalendarEventType,
            name="calendar_event_type",
            values_callable=lambda enum_cls: [m.value for m in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=CalendarEventType.OTHER,
        server_default=CalendarEventType.OTHER.value,
        index=True,
    )
    category: Mapped[CalendarEventCategory] = mapped_column(
        Enum(
            CalendarEventCategory,
            name="calendar_event_category",
            values_callable=lambda enum_cls: [m.value for m in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=CalendarEventCategory.ACADEMIC,
        server_default=CalendarEventCategory.ACADEMIC.value,
    )
    start_datetime: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    end_datetime: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, default=None)
    color: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, default=None)
    is_all_day: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    student: Mapped[Student] = relationship(
        "Student", back_populates="calendar_events", lazy="selectin"
    )
    subject: Mapped[Optional[Subject]] = relationship(
        "Subject", back_populates="calendar_events", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<CalendarEvent(id={self.id!r}, title={self.title!r}, type={self.event_type!r})>"
