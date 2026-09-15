"""Attendance HTTP endpoints."""

from __future__ import annotations

from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.domain.enums.attendance_status import AttendanceStatus
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceRead,
    AttendanceSubjectSummary,
    AttendanceUpdate,
)
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.services.attendance import AttendanceService, get_attendance_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/attendance", tags=["Attendance"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_409_CONFLICT: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
}


def _attendance_service(db: DbSession) -> AttendanceService:
    return get_attendance_service(db)


AttendanceServiceDep = Annotated[AttendanceService, Depends(_attendance_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[AttendanceRead],
    summary="List attendance sessions",
    responses=_ERROR_RESPONSES,
)
async def list_attendance(
    current_user: CurrentUser,
    service: AttendanceServiceDep,
    pagination: PaginationDep,
    subject_id: Annotated[
        UUID | None,
        Query(description="Filter by subject id"),
    ] = None,
    status_filter: Annotated[
        AttendanceStatus | None,
        Query(alias="status", description="Filter by attendance status"),
    ] = None,
    date_from: Annotated[
        date | None,
        Query(description="Inclusive start date (YYYY-MM-DD)"),
    ] = None,
    date_to: Annotated[
        date | None,
        Query(description="Inclusive end date (YYYY-MM-DD)"),
    ] = None,
) -> PaginatedResponse[AttendanceRead]:
    """Return paginated attendance sessions for the current student."""
    return await service.list_attendance(
        current_user,
        pagination,
        subject_id=subject_id,
        status=status_filter,
        date_from=date_from,
        date_to=date_to,
    )


@router.get(
    "/{subject_id}/summary",
    response_model=AttendanceSubjectSummary,
    summary="Get attendance summary for a subject",
    responses=_ERROR_RESPONSES,
)
async def get_attendance_summary(
    subject_id: UUID,
    current_user: CurrentUser,
    service: AttendanceServiceDep,
) -> AttendanceSubjectSummary:
    """
    Return rolled-up attendance statistics for a subject.

    Declared before ``/{subject_id}`` so ``summary`` is not captured as an id.
    """
    return await service.get_subject_summary(current_user, subject_id)


@router.get(
    "/{subject_id}",
    response_model=PaginatedResponse[AttendanceRead],
    summary="List attendance for a subject",
    responses=_ERROR_RESPONSES,
    openapi_extra={
        "description": (
            "Path parameter is the **subject** id. "
            "Use PUT/DELETE `/attendance/{id}` with an **attendance** id to mutate rows."
        )
    },
)
async def get_attendance_by_subject(
    subject_id: UUID,
    current_user: CurrentUser,
    service: AttendanceServiceDep,
    pagination: PaginationDep,
) -> PaginatedResponse[AttendanceRead]:
    """Return paginated attendance sessions for the given subject."""
    return await service.get_by_subject(current_user, subject_id, pagination)


@router.post(
    "",
    response_model=AttendanceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create attendance session",
    responses=_ERROR_RESPONSES,
)
async def create_attendance(
    payload: AttendanceCreate,
    current_user: CurrentUser,
    service: AttendanceServiceDep,
) -> AttendanceRead:
    """Record a class attendance session for a subject."""
    return await service.create_attendance(current_user, payload)


@router.put(
    "/{attendance_id}",
    response_model=AttendanceRead,
    summary="Update attendance session",
    responses=_ERROR_RESPONSES,
)
async def update_attendance(
    attendance_id: UUID,
    payload: AttendanceUpdate,
    current_user: CurrentUser,
    service: AttendanceServiceDep,
) -> AttendanceRead:
    """Update an existing attendance session by attendance id."""
    return await service.update_attendance(current_user, attendance_id, payload)


@router.delete(
    "/{attendance_id}",
    response_model=MessageResponse,
    summary="Delete attendance session",
    responses=_ERROR_RESPONSES,
)
async def delete_attendance(
    attendance_id: UUID,
    current_user: CurrentUser,
    service: AttendanceServiceDep,
) -> MessageResponse:
    """Soft-delete an attendance session by attendance id."""
    await service.delete_attendance(current_user, attendance_id)
    return MessageResponse(message="Attendance record deleted")
