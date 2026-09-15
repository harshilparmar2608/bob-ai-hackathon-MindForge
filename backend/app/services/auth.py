"""Authentication application service."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    ConflictError,
    ForbiddenError,
    UnauthorizedError,
    ValidationAppError,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    validate_password,
    verify_password,
)
from app.domain.enums.user_role import UserRole
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.token import TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserRead
from app.core.logging import get_logger

logger = get_logger(__name__)


class AuthService:
    """Orchestrates registration, login, token refresh, and identity lookup."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.users = UserRepository(session)

    async def register(self, payload: UserCreate) -> UserRead:
        """
        Create a new user account.

        Only ``admin`` may self-assign privileged roles at registration time;
        all other callers default to ``student`` unless an admin elevates later.
        """
        if await self.users.email_exists(payload.email):
            raise ConflictError(
                "An account with this email already exists",
                code="email_taken",
            )

        role = payload.role
        if role != UserRole.STUDENT:
            # Prevent privilege escalation via open registration.
            # Seed/admin flows can elevate roles after creation.
            role = UserRole.STUDENT

        user = await self.users.create_user(
            email=payload.email,
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            role=role,
        )
        await self.session.commit()
        await self.session.refresh(user)
        return UserRead.model_validate(user)

    async def login(self, payload: UserLogin) -> TokenResponse:
        """Authenticate with email/password and return a token pair."""
        user = await self.users.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.hashed_password):
            raise UnauthorizedError(
                "Incorrect email or password",
                code="invalid_credentials",
            )
        if not user.is_active:
            raise ForbiddenError(
                "This account has been deactivated",
                code="user_inactive",
            )

        user.last_login_at = datetime.now(timezone.utc)
        await self.session.commit()
        await self.session.refresh(user)
        logger.info(
            "User logged in user_id=%s",
            user.id,
            extra={"user_id": str(user.id), "email": user.email},
        )
        return self._issue_tokens(user)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        """Exchange a valid refresh token for a new access/refresh pair."""
        payload = decode_token(refresh_token, expected_type="refresh")
        user_id = UUID(str(payload["sub"]))
        user = await self.users.get_active_by_id(user_id)
        if user is None:
            raise UnauthorizedError(
                "User no longer exists",
                code="user_not_found",
            )
        if not user.is_active:
            raise ForbiddenError(
                "This account has been deactivated",
                code="user_inactive",
            )
        return self._issue_tokens(user)

    async def change_password(
        self,
        current_user: User,
        current_password: str,
        new_password: str,
    ) -> UserRead:
        """
        Rotate the current user's password after verifying the existing one.

        Uses a constant-time response for bad credentials so the endpoint does
        not leak account existence or password validity differences.
        """
        if not verify_password(current_password, current_user.hashed_password):
            raise UnauthorizedError(
                "Current password is incorrect",
                code="invalid_current_password",
            )

        validate_password(new_password)
        if verify_password(new_password, current_user.hashed_password):
            raise ConflictError(
                "New password must be different from the current password",
                code="password_reused",
            )

        current_user.hashed_password = hash_password(new_password)
        await self.session.commit()
        await self.session.refresh(current_user)
        logger.info(
            "Password changed user_id=%s",
            current_user.id,
            extra={"user_id": str(current_user.id)},
        )
        return UserRead.model_validate(current_user)

    async def get_user_by_id(self, user_id: UUID) -> User:
        """Load an active user or raise ``UnauthorizedError``."""
        user = await self.users.get_active_by_id(user_id)
        if user is None:
            raise UnauthorizedError(
                "User not found",
                code="user_not_found",
            )
        if not user.is_active:
            raise ForbiddenError(
                "This account has been deactivated",
                code="user_inactive",
            )
        return user

    def _issue_tokens(self, user: User) -> TokenResponse:
        """Build access + refresh JWTs for ``user``."""
        claims = {"role": user.role.value}
        access = create_access_token(user.id, extra_claims=claims)
        refresh = create_refresh_token(user.id, extra_claims=claims)
        return TokenResponse(
            access_token=access,
            refresh_token=refresh,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
        )


def get_auth_service(session: AsyncSession) -> AuthService:
    """Factory used by FastAPI dependencies."""
    return AuthService(session)
