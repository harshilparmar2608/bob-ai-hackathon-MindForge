"""Subject (course) ORM model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column

if TYPE_CHECKING:
    from app.models.assignment import Assignment
    from app.models.attendance import Attendance
    from app.models.calendar_event import CalendarEvent
    from app.models.note import Note
    from app.models.study_plan import StudyPlan
    from app.models.student import Student


class Subject(Base, TimestampMixin, SoftDeleteMixin):
    """
    Course/subject enrolled by a student.

    Relationships:
    - ``Student`` 1:N ``Subject``
    - ``Subject`` 1:N ``Attendance``
    """

    __tablename__ = "subjects"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "code",
            name="uq_subjects_student_id_code",
        ),
    )

    id: Mapped[uuid.UUID] = uuid_pk_column()
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    code: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    credits: Mapped[float] = mapped_column(Float, nullable=False, default=3.0)
    semester: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, default=None)
    instructor_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        default=None,
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    color: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, default=None)
    target_study_hours: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    logged_study_hours: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    student: Mapped[Student] = relationship(
        "Student",
        back_populates="subjects",
        lazy="selectin",
    )
    attendance_records: Mapped[list[Attendance]] = relationship(
        "Attendance",
        back_populates="subject",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    assignments: Mapped[list[Assignment]] = relationship(
        "Assignment",
        back_populates="subject",
        lazy="selectin",
    )
    notes: Mapped[list[Note]] = relationship(
        "Note",
        back_populates="subject",
        lazy="selectin",
    )
    study_plans: Mapped[list[StudyPlan]] = relationship(
        "StudyPlan",
        back_populates="subject",
        lazy="selectin",
    )
    calendar_events: Mapped[list[CalendarEvent]] = relationship(
        "CalendarEvent",
        back_populates="subject",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Subject(id={self.id!r}, code={self.code!r}, name={self.name!r})>"
