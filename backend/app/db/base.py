"""SQLAlchemy 2.0 declarative base, mixins, and UUID helpers."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, MetaData, Uuid, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


# Naming conventions keep Alembic autogenerate diffs stable across databases.
POSTGRES_INDEXES_NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


def new_uuid() -> uuid.UUID:
    """Generate a random UUID4 primary key value."""
    return uuid.uuid4()


def uuid_pk_column(**kwargs: Any) -> Mapped[uuid.UUID]:
    """
    Standard UUID primary key column.

    Uses SQLAlchemy's portable ``Uuid`` type:
    - PostgreSQL: native UUID
    - SQLite: CHAR(32) storage with Python ``uuid.UUID`` values
    """
    return mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=new_uuid,
        **kwargs,
    )


def uuid_column(*, nullable: bool = False, **kwargs: Any) -> Mapped[uuid.UUID]:
    """Standard UUID column for foreign keys and opaque identifiers."""
    return mapped_column(Uuid(as_uuid=True), nullable=nullable, **kwargs)


class TimestampMixin:
    """Adds ``created_at`` and ``updated_at`` timezone-aware timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """Adds soft-delete support via a nullable ``deleted_at`` timestamp."""

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
        index=True,
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    def soft_delete(self, *, when: datetime | None = None) -> None:
        """Mark the row as deleted without removing it from the database."""
        self.deleted_at = when or datetime.now(timezone.utc)

    def restore(self) -> None:
        """Clear soft-delete marker."""
        self.deleted_at = None


class Base(DeclarativeBase):
    """
    Declarative base for all ORM models.

    Models should subclass ``Base`` (and optionally mix in
    ``TimestampMixin`` / ``SoftDeleteMixin``). Do not instantiate this class.
    """

    metadata = MetaData(naming_convention=POSTGRES_INDEXES_NAMING_CONVENTION)

    def __repr__(self) -> str:
        class_name = self.__class__.__name__
        pk_columns = [col.name for col in self.__table__.primary_key.columns]
        pk_repr = ", ".join(
            f"{name}={getattr(self, name, None)!r}" for name in pk_columns
        )
        return f"<{class_name}({pk_repr})>"
