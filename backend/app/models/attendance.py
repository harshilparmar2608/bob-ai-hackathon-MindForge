"""Attendance session ORM model."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Date, Enum, ForeignKey, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column
from app.domain.enums.attendance_status import AttendanceStatus

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.subject import Subject


class Attendance(Base, TimestampMixin, SoftDeleteMixin):
    """
    Single class attendance entry for a student in a subject.

    Relationships:
    - ``Student`` 1:N ``Attendance``
    - ``Subject`` 1:N ``Attendance``
    """

    __tablename__ = "attendance"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "subject_id",
            "session_date",
            name="uq_attendance_student_subject_date",
        ),
    )

    id: Mapped[uuid.UUID] = uuid_pk_column()
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subjects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    session_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    status: Mapped[AttendanceStatus] = mapped_column(
        Enum(
            AttendanceStatus,
            name="attendance_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=AttendanceStatus.PRESENT,
        server_default=AttendanceStatus.PRESENT.value,
        index=True,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    recorded_by: Mapped[Optional[str]] = mapped_column(String(128), nullable=True, default=None)

    student: Mapped[Student] = relationship(
        "Student",
        back_populates="attendance_records",
        lazy="selectin",
    )
    subject: Mapped[Subject] = relationship(
        "Subject",
        back_populates="attendance_records",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Attendance(id={self.id!r}, subject_id={self.subject_id!r}, "
            f"date={self.session_date!r}, status={self.status!r})>"
        )
