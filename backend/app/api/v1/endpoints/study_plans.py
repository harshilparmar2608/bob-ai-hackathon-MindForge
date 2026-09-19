"""Study plan HTTP endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.domain.enums.assignment_status import AssignmentStatus
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.schemas.study_plan import StudyPlanCreate, StudyPlanRead, StudyPlanUpdate
from app.services.study_plan import StudyPlanService, get_study_plan_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/study-plans", tags=["Study Plans"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
}


def _study_plan_service(db: DbSession) -> StudyPlanService:
    return get_study_plan_service(db)


StudyPlanServiceDep = Annotated[StudyPlanService, Depends(_study_plan_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[StudyPlanRead],
    summary="List study plans",
    responses=_ERROR_RESPONSES,
)
async def list_study_plans(
    current_user: CurrentUser,
    service: StudyPlanServiceDep,
    pagination: PaginationDep,
    subject_id: Annotated[UUID | None, Query(description="Filter by subject id")] = None,
    status_filter: Annotated[
        AssignmentStatus | None,
        Query(alias="status", description="Filter by status"),
    ] = None,
) -> PaginatedResponse[StudyPlanRead]:
    """Return a paginated list of study plans for the current student."""
    return await service.list_plans(
        current_user,
        pagination,
        subject_id=subject_id,
        status=status_filter,
    )


@router.get(
    "/{plan_id}",
    response_model=StudyPlanRead,
    summary="Get study plan by id",
    responses=_ERROR_RESPONSES,
)
async def get_study_plan(
    plan_id: UUID,
    current_user: CurrentUser,
    service: StudyPlanServiceDep,
) -> StudyPlanRead:
    """Return a single study plan owned by the current student."""
    return await service.get_plan(current_user, plan_id)


@router.post(
    "",
    response_model=StudyPlanRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create study plan",
    responses=_ERROR_RESPONSES,
)
async def create_study_plan(
    payload: StudyPlanCreate,
    current_user: CurrentUser,
    service: StudyPlanServiceDep,
) -> StudyPlanRead:
    """Create a new study plan for the current student."""
    return await service.create_plan(current_user, payload)


@router.put(
    "/{plan_id}",
    response_model=StudyPlanRead,
    summary="Update study plan",
    responses=_ERROR_RESPONSES,
)
async def update_study_plan(
    plan_id: UUID,
    payload: StudyPlanUpdate,
    current_user: CurrentUser,
    service: StudyPlanServiceDep,
) -> StudyPlanRead:
    """Update an existing study plan owned by the current student."""
    return await service.update_plan(current_user, plan_id, payload)


@router.delete(
    "/{plan_id}",
    response_model=MessageResponse,
    summary="Delete study plan",
    responses=_ERROR_RESPONSES,
)
async def delete_study_plan(
    plan_id: UUID,
    current_user: CurrentUser,
    service: StudyPlanServiceDep,
) -> MessageResponse:
    """Soft-delete a study plan owned by the current student."""
    await service.delete_plan(current_user, plan_id)
    return MessageResponse(message="Study plan deleted")
