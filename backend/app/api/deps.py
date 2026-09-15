"""FastAPI dependency injection hooks."""

from __future__ import annotations

from collections.abc import Callable, Coroutine
from typing import Annotated, Any
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import DbSession, get_db
from app.domain.enums.user_role import UserRole
from app.models.user import User
from app.services.auth import AuthService, get_auth_service

bearer_scheme = HTTPBearer(auto_error=False)


async def get_auth_service_dep(db: DbSession) -> AuthService:
    """Provide an :class:`AuthService` bound to the request session."""
    return get_auth_service(db)


async def get_current_user(
    db: DbSession,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> User:
    """
    Resolve the authenticated user from a Bearer access token.

    Raises
    ------
    UnauthorizedError
        When the header is missing/invalid or the user cannot be loaded.
    ForbiddenError
        When the account is inactive.
    """
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise UnauthorizedError(
            "Authentication credentials were not provided",
            code="not_authenticated",
        )

    payload = decode_token(credentials.credentials, expected_type="access")
    try:
        user_id = UUID(str(payload["sub"]))
    except (ValueError, TypeError) as exc:
        raise UnauthorizedError(
            "Invalid token subject",
            code="invalid_token",
        ) from exc

    auth = get_auth_service(db)
    return await auth.get_user_by_id(user_id)


def require_roles(
    *roles: UserRole,
) -> Callable[..., Coroutine[Any, Any, User]]:
    """
    Dependency factory enforcing that the current user has one of ``roles``.

    Example::

        @router.get("/admin")
        async def admin_only(user: User = Depends(require_roles(UserRole.ADMIN))):
            ...
    """
    if not roles:
        raise ValueError("At least one role must be specified")

    allowed = frozenset(roles)

    async def _dependency(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.role not in allowed:
            raise ForbiddenError(
                "You do not have permission to perform this action",
                code="insufficient_role",
                details={
                    "required_roles": [role.value for role in allowed],
                    "current_role": current_user.role.value,
                },
            )
        return current_user

    return _dependency


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service_dep)]
CurrentUser = Annotated[User, Depends(get_current_user)]
DbSessionDep = DbSession

# Role shortcuts for common authorization checks
StudentUser = Annotated[User, Depends(require_roles(UserRole.STUDENT))]
FacultyUser = Annotated[
    User,
    Depends(require_roles(UserRole.FACULTY, UserRole.ADMIN)),
]
AdvisorUser = Annotated[
    User,
    Depends(require_roles(UserRole.ADVISOR, UserRole.ADMIN)),
]
AdminUser = Annotated[User, Depends(require_roles(UserRole.ADMIN))]
StaffUser = Annotated[
    User,
    Depends(
        require_roles(
            UserRole.FACULTY,
            UserRole.ADVISOR,
            UserRole.ADMIN,
        )
    ),
]

__all__ = [
    "AdminUser",
    "AdvisorUser",
    "AuthServiceDep",
    "CurrentUser",
    "DbSession",
    "DbSessionDep",
    "FacultyUser",
    "StaffUser",
    "StudentUser",
    "get_auth_service_dep",
    "get_current_user",
    "get_db",
    "require_roles",
]
