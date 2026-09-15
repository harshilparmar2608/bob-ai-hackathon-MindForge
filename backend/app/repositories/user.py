"""User repository — data access for the ``users`` table."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.enums.user_role import UserRole
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for :class:`~app.models.user.User` aggregates."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, User)

    async def get_by_email(self, email: str) -> User | None:
        """Return the active (non-soft-deleted) user for ``email``, if any."""
        stmt = select(User).where(
            func.lower(User.email) == email.lower(),
            User.deleted_at.is_(None),
        )
        return await self.session.scalar(stmt)

    async def get_active_by_id(self, user_id: uuid.UUID) -> User | None:
        """Return a non-deleted user by id."""
        stmt = select(User).where(
            User.id == user_id,
            User.deleted_at.is_(None),
        )
        return await self.session.scalar(stmt)

    async def email_exists(self, email: str) -> bool:
        """Return ``True`` when a non-deleted user already owns ``email``."""
        stmt = (
            select(func.count())
            .select_from(User)
            .where(
                func.lower(User.email) == email.lower(),
                User.deleted_at.is_(None),
            )
        )
        count = await self.session.scalar(stmt)
        return bool(count and count > 0)

    async def create_user(
        self,
        *,
        email: str,
        hashed_password: str,
        full_name: str,
        role: UserRole,
    ) -> User:
        """Insert a new user row and return the refreshed entity."""
        user = User(
            email=email.lower().strip(),
            hashed_password=hashed_password,
            full_name=full_name,
            role=role,
        )
        return await self.add(user)
