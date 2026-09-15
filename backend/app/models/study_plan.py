"""Study plan ORM model."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, Enum, Float, ForeignKey, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column
from app.domain.enums.assignment_status import AssignmentStatus

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.subject import Subject


class StudyPlan(Base, TimestampMixin, SoftDeleteMixin):
    """
    Structured weekly/session study plan for a student.

    Relationships:
    - ``Student`` 1:N ``StudyPlan``
    - ``Subject`` 1:N ``StudyPlan`` (optional)
    """

    __tablename__ = "study_plans"

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
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, default=None)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, default=None)
    target_hours: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    logged_hours: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status: Mapped[AssignmentStatus] = mapped_column(
        Enum(
            AssignmentStatus,
            name="study_plan_status",
            values_callable=lambda enum_cls: [m.value for m in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=AssignmentStatus.TODO,
        server_default=AssignmentStatus.TODO.value,
        index=True,
    )
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    student: Mapped[Student] = relationship(
        "Student", back_populates="study_plans", lazy="selectin"
    )
    subject: Mapped[Optional[Subject]] = relationship(
        "Subject", back_populates="study_plans", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<StudyPlan(id={self.id!r}, title={self.title!r})>"
