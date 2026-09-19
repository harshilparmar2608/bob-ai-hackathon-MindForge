"""Authentication HTTP endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from pydantic import BaseModel, Field

from app.api.deps import AuthServiceDep, CurrentUser, DbSession
from app.core.exceptions import UnauthorizedError
from app.schemas.common import ErrorResponse
from app.schemas.token import RefreshTokenRequest, TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/auth", tags=["Authentication"])

_ERROR_RESPONSES = {
    status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_409_CONFLICT: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
}


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    responses=_ERROR_RESPONSES,
)
async def register(
    payload: UserCreate,
    auth: AuthServiceDep,
) -> UserRead:
    """
    Create a new CampusPilot account.

    Open registration always creates a ``student`` role. Privileged roles
    must be assigned by an administrator after signup.
    """
    return await auth.register(payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login with email and password",
    responses=_ERROR_RESPONSES,
)
async def login(
    payload: UserLogin,
    auth: AuthServiceDep,
) -> TokenResponse:
    """Authenticate and receive access + refresh JWTs."""
    return await auth.login(payload)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    responses=_ERROR_RESPONSES,
)
async def refresh_token(
    payload: RefreshTokenRequest,
    auth: AuthServiceDep,
) -> TokenResponse:
    """Exchange a valid refresh token for a new token pair."""
    return await auth.refresh(payload.refresh_token)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get the current authenticated user",
    responses=_ERROR_RESPONSES,
)
async def read_current_user(
    current_user: CurrentUser,
) -> UserRead:
    """Return the profile of the user identified by the Bearer access token."""
    return UserRead.model_validate(current_user)


class ChangePasswordRequest(BaseModel):
    """Change-password payload."""

    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)


@router.patch(
    "/me/password",
    response_model=UserRead,
    summary="Change the authenticated user's password",
    responses=_ERROR_RESPONSES,
)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    auth: AuthServiceDep,
) -> UserRead:
    """
    Rotate the password for the current user after verifying the current one.

    Returns the refreshed user representation (tokens stay valid).
    """
    return await auth.change_password(
        current_user,
        payload.current_password,
        payload.new_password,
    )
