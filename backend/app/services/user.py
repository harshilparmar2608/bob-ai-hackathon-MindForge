"""User profile application service."""

from __future__ import annotations

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserRead, UserUpdate

logger = logging.getLogger(__name__)


class UserService:
    """Profile use-cases for the authenticated user."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)

    async def update_me(self, current_user: User, payload: UserUpdate) -> UserRead:
        """
        Update the authenticated user's own profile.

        Only ``full_name`` / ``bio`` are mutable here. ``role`` and ``is_active``
        are privileged fields and can only be changed by an administrator via a
        dedicated admin surface — self-service updates ignore them so privilege
        escalation is impossible.
        """
        data = payload.model_dump(exclude_unset=True)
        data.pop("role", None)
        data.pop("is_active", None)

        full_name = data.get("full_name")
        if full_name is not None:
            cleaned = " ".join(str(full_name).split())
            if not cleaned:
                raise ConflictError(
                    "Full name cannot be blank",
                    code="invalid_full_name",
                )
            data["full_name"] = cleaned

        if not data:
            return UserRead.model_validate(current_user)

        for field, value in data.items():
            setattr(current_user, field, value)

        await self.session.commit()
        await self.session.refresh(current_user)
        logger.info("Updated user profile user_id=%s", current_user.id)
        return UserRead.model_validate(current_user)


def get_user_service(session: AsyncSession) -> UserService:
    """Factory for FastAPI dependencies."""
    return UserService(session)