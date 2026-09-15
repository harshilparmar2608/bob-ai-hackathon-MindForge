"""Career goal / milestone ORM model."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Date, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column

if TYPE_CHECKING:
    from app.models.student import Student


class CareerGoal(Base, TimestampMixin, SoftDeleteMixin):
    """
    Career goal or milestone tracked by a student.

    Relationships:
    - ``Student`` 1:N ``CareerGoal``
    """

    __tablename__ = "career_goals"

    id: Mapped[uuid.UUID] = uuid_pk_column()
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, default=None)
    target_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, default=None)
    is_achieved: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false", index=True
    )
    achieved_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True, default=None)
    skills_required: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        default=None,
        comment="Comma-separated list of required skills",
    )

    student: Mapped[Student] = relationship(
        "Student", back_populates="career_goals", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<CareerGoal(id={self.id!r}, title={self.title!r})>"
