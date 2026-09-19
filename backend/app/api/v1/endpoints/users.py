"""User profile HTTP endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field

from app.api.deps import CurrentUser, DbSession
from app.schemas.common import ErrorResponse
from app.schemas.user import UserRead, UserUpdate
from app.services.user import UserService, get_user_service

router = APIRouter(prefix="/users", tags=["Users"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
}


def _user_service(db: DbSession) -> UserService:
    return get_user_service(db)


UserServiceDep = Annotated[UserService, Depends(_user_service)]


@router.patch(
    "/me",
    response_model=UserRead,
    summary="Update the authenticated user's own profile",
    responses=_ERROR_RESPONSES,
)
async def update_me(
    payload: UserUpdate,
    current_user: CurrentUser,
    service: UserServiceDep,
) -> UserRead:
    """
    Update mutable profile fields (``full_name``, ``bio``) for the current user.

    Privileged fields (``role``, ``is_active``) are ignored on this endpoint and
    can only be changed by an administrator.
    """
    return await service.update_me(current_user, payload)