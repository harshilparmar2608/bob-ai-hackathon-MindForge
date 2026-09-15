"""Assignment ORM model."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, DateTime, Enum, Float, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column
from app.domain.enums.assignment_status import AssignmentStatus
from app.domain.enums.priority_level import PriorityLevel

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.subject import Subject


class Assignment(Base, TimestampMixin, SoftDeleteMixin):
    """
    Academic assignment for a student in a subject.

    Relationships:
    - ``Student`` 1:N ``Assignment``
    - ``Subject`` 1:N ``Assignment``
    """

    __tablename__ = "assignments"

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
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, default=None, index=True)
    status: Mapped[AssignmentStatus] = mapped_column(
        Enum(
            AssignmentStatus,
            name="assignment_status",
            values_callable=lambda enum_cls: [m.value for m in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=AssignmentStatus.TODO,
        server_default=AssignmentStatus.TODO.value,
        index=True,
    )
    priority: Mapped[PriorityLevel] = mapped_column(
        Enum(
            PriorityLevel,
            name="priority_level",
            values_callable=lambda enum_cls: [m.value for m in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=PriorityLevel.MEDIUM,
        server_default=PriorityLevel.MEDIUM.value,
    )
    grade: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    max_grade: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=None)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )

    student: Mapped[Student] = relationship(
        "Student", back_populates="assignments", lazy="selectin"
    )
    subject: Mapped[Optional[Subject]] = relationship(
        "Subject", back_populates="assignments", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Assignment(id={self.id!r}, title={self.title!r}, status={self.status!r})>"
