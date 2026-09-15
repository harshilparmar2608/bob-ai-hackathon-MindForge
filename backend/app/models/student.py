"""Student academic profile ORM model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Float, ForeignKey, Integer, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column

if TYPE_CHECKING:
    from app.models.assignment import Assignment
    from app.models.attendance import Attendance
    from app.models.calendar_event import CalendarEvent
    from app.models.career import CareerGoal
    from app.models.note import Note
    from app.models.recommendation import Recommendation
    from app.models.study_plan import StudyPlan
    from app.models.subject import Subject
    from app.models.user import User


class Student(Base, TimestampMixin, SoftDeleteMixin):
    """
    Academic profile for a CampusPilot user.

    Relationship: ``User`` 1:1 ``Student``.
    """

    __tablename__ = "students"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_students_user_id"),
        UniqueConstraint("enrollment_number", name="uq_students_enrollment_number"),
    )

    id: Mapped[uuid.UUID] = uuid_pk_column()
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    enrollment_number: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    major: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    college: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    semester: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    current_period: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    grad_year: Mapped[str] = mapped_column(String(64), nullable=False, default="")
    avatar_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True, default=None)
    current_gpa: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    target_gpa: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    class_rank: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, default=None)
    attendance_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    placement_readiness: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    academic_health_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    user: Mapped[User] = relationship("User", back_populates="student", lazy="selectin")
    subjects: Mapped[list[Subject]] = relationship(
        "Subject",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    attendance_records: Mapped[list[Attendance]] = relationship(
        "Attendance",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    assignments: Mapped[list[Assignment]] = relationship(
        "Assignment",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    notes: Mapped[list[Note]] = relationship(
        "Note",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    study_plans: Mapped[list[StudyPlan]] = relationship(
        "StudyPlan",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    calendar_events: Mapped[list[CalendarEvent]] = relationship(
        "CalendarEvent",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    career_goals: Mapped[list[CareerGoal]] = relationship(
        "CareerGoal",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )
    recommendations: Mapped[list[Recommendation]] = relationship(
        "Recommendation",
        back_populates="student",
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Student(id={self.id!r}, enrollment_number={self.enrollment_number!r})>"
        )
