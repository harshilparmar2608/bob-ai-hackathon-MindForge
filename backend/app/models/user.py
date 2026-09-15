"""User ORM model."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, Enum, String, Text, true
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, SoftDeleteMixin, TimestampMixin, uuid_pk_column
from app.domain.enums.user_role import UserRole

if TYPE_CHECKING:
    from app.models.student import Student


class User(Base, TimestampMixin, SoftDeleteMixin):
    """Authenticated CampusPilot account."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk_column()
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            native_enum=False,
            validate_strings=True,
        ),
        nullable=False,
        default=UserRole.STUDENT,
        server_default=UserRole.STUDENT.value,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=true(),
    )
    last_login_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)

    student: Mapped[Optional[Student]] = relationship(
        "Student",
        back_populates="user",
        uselist=False,
        lazy="selectin",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id!r}, email={self.email!r}, role={self.role!r})>"
