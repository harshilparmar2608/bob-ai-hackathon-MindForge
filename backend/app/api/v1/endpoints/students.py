"""Student profile HTTP endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.common import ErrorResponse
from app.schemas.student import StudentProfileRead, StudentProfileUpdate
from app.services.student import StudentService, get_student_service

router = APIRouter(prefix="/student", tags=["Student"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_409_CONFLICT: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
}


def _student_service(db: DbSession) -> StudentService:
    return get_student_service(db)


StudentServiceDep = Annotated[StudentService, Depends(_student_service)]


@router.get(
    "/profile",
    response_model=StudentProfileRead,
    summary="Get current student academic profile",
    responses=_ERROR_RESPONSES,
)
async def get_student_profile(
    current_user: CurrentUser,
    service: StudentServiceDep,
) -> StudentProfileRead:
    """
    Return the authenticated user's academic profile.

    A default profile is auto-created on first access if one does not exist.
    """
    return await service.get_profile(current_user)


@router.put(
    "/profile",
    response_model=StudentProfileRead,
    summary="Update current student academic profile",
    responses=_ERROR_RESPONSES,
)
async def update_student_profile(
    payload: StudentProfileUpdate,
    current_user: CurrentUser,
    service: StudentServiceDep,
) -> StudentProfileRead:
    """Update mutable fields on the authenticated student's academic profile."""
    return await service.update_profile(current_user, payload)
