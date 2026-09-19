"""Assignment HTTP endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.domain.enums.assignment_status import AssignmentStatus
from app.domain.enums.priority_level import PriorityLevel
from app.schemas.assignment import AssignmentCreate, AssignmentRead, AssignmentUpdate
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.services.assignment import AssignmentService, get_assignment_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/assignments", tags=["Assignments"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
}


def _assignment_service(db: DbSession) -> AssignmentService:
    return get_assignment_service(db)


AssignmentServiceDep = Annotated[AssignmentService, Depends(_assignment_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[AssignmentRead],
    summary="List assignments",
    responses=_ERROR_RESPONSES,
)
async def list_assignments(
    current_user: CurrentUser,
    service: AssignmentServiceDep,
    pagination: PaginationDep,
    subject_id: Annotated[UUID | None, Query(description="Filter by subject id")] = None,
    status_filter: Annotated[
        AssignmentStatus | None,
        Query(alias="status", description="Filter by status"),
    ] = None,
    priority: Annotated[
        PriorityLevel | None,
        Query(description="Filter by priority"),
    ] = None,
) -> PaginatedResponse[AssignmentRead]:
    """Return a paginated list of assignments for the current student."""
    return await service.list_assignments(
        current_user,
        pagination,
        subject_id=subject_id,
        status=status_filter,
        priority=priority,
    )


@router.get(
    "/{assignment_id}",
    response_model=AssignmentRead,
    summary="Get assignment by id",
    responses=_ERROR_RESPONSES,
)
async def get_assignment(
    assignment_id: UUID,
    current_user: CurrentUser,
    service: AssignmentServiceDep,
) -> AssignmentRead:
    """Return a single assignment owned by the current student."""
    return await service.get_assignment(current_user, assignment_id)


@router.post(
    "",
    response_model=AssignmentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create assignment",
    responses=_ERROR_RESPONSES,
)
async def create_assignment(
    payload: AssignmentCreate,
    current_user: CurrentUser,
    service: AssignmentServiceDep,
) -> AssignmentRead:
    """Create a new assignment for the current student."""
    return await service.create_assignment(current_user, payload)


@router.put(
    "/{assignment_id}",
    response_model=AssignmentRead,
    summary="Update assignment",
    responses=_ERROR_RESPONSES,
)
async def update_assignment(
    assignment_id: UUID,
    payload: AssignmentUpdate,
    current_user: CurrentUser,
    service: AssignmentServiceDep,
) -> AssignmentRead:
    """Update an existing assignment owned by the current student."""
    return await service.update_assignment(current_user, assignment_id, payload)


@router.delete(
    "/{assignment_id}",
    response_model=MessageResponse,
    summary="Delete assignment",
    responses=_ERROR_RESPONSES,
)
async def delete_assignment(
    assignment_id: UUID,
    current_user: CurrentUser,
    service: AssignmentServiceDep,
) -> MessageResponse:
    """Soft-delete an assignment owned by the current student."""
    await service.delete_assignment(current_user, assignment_id)
    return MessageResponse(message="Assignment deleted")
