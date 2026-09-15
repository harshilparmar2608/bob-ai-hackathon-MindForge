"""Recommendation ORM model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column
from app.domain.enums.priority_level import PriorityLevel

if TYPE_CHECKING:
    from app.models.student import Student


class Recommendation(Base, TimestampMixin, SoftDeleteMixin):
    """
    AI or system-generated academic recommendation for a student.

    Relationships:
    - ``Student`` 1:N ``Recommendation``
    """

    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = uuid_pk_column()
    student_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    source: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True,
        default=None,
        comment="e.g. 'ai', 'system', 'advisor'",
    )
    priority: Mapped[PriorityLevel] = mapped_column(
        Enum(
            PriorityLevel,
            name="recommendation_priority",
            values_callable=lambda enum_cls: [m.value for m in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=PriorityLevel.MEDIUM,
        server_default=PriorityLevel.MEDIUM.value,
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false", index=True
    )
    is_dismissed: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    student: Mapped[Student] = relationship(
        "Student", back_populates="recommendations", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Recommendation(id={self.id!r}, category={self.category!r})>"
