"""Note ORM model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, ForeignKey, String, Text, Uuid, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column

if TYPE_CHECKING:
    from app.models.student import Student
    from app.models.subject import Subject


class Note(Base, TimestampMixin, SoftDeleteMixin):
    """
    Study note for a student, optionally linked to a subject.

    Relationships:
    - ``Student`` 1:N ``Note``
    - ``Subject`` 1:N ``Note`` (optional)
    """

    __tablename__ = "notes"

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
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    tags: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, default=None,
        comment="Comma-separated tags for client-side filtering",
    )
    is_pinned: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )

    student: Mapped[Student] = relationship(
        "Student", back_populates="notes", lazy="selectin"
    )
    subject: Mapped[Optional[Subject]] = relationship(
        "Subject", back_populates="notes", lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<Note(id={self.id!r}, title={self.title!r})>"
