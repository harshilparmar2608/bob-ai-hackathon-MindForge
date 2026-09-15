"""Career goal HTTP endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.career import CareerGoalCreate, CareerGoalRead, CareerGoalUpdate
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.services.career import CareerService, get_career_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/career", tags=["Career"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
}


def _career_service(db: DbSession) -> CareerService:
    return get_career_service(db)


CareerServiceDep = Annotated[CareerService, Depends(_career_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[CareerGoalRead],
    summary="List career goals",
    responses=_ERROR_RESPONSES,
)
async def list_goals(
    current_user: CurrentUser,
    service: CareerServiceDep,
    pagination: PaginationDep,
    category: Annotated[str | None, Query(description="Filter by category")] = None,
    achieved: Annotated[
        bool | None,
        Query(description="Filter by achievement status"),
    ] = None,
) -> PaginatedResponse[CareerGoalRead]:
    """Return a paginated list of career goals for the current student."""
    return await service.list_goals(
        current_user,
        pagination,
        category=category,
        achieved=achieved,
    )


@router.get(
    "/{goal_id}",
    response_model=CareerGoalRead,
    summary="Get career goal by id",
    responses=_ERROR_RESPONSES,
)
async def get_goal(
    goal_id: UUID,
    current_user: CurrentUser,
    service: CareerServiceDep,
) -> CareerGoalRead:
    """Return a single career goal owned by the current student."""
    return await service.get_goal(current_user, goal_id)


@router.post(
    "",
    response_model=CareerGoalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create career goal",
    responses=_ERROR_RESPONSES,
)
async def create_goal(
    payload: CareerGoalCreate,
    current_user: CurrentUser,
    service: CareerServiceDep,
) -> CareerGoalRead:
    """Create a new career goal for the current student."""
    return await service.create_goal(current_user, payload)


@router.put(
    "/{goal_id}",
    response_model=CareerGoalRead,
    summary="Update career goal",
    responses=_ERROR_RESPONSES,
)
async def update_goal(
    goal_id: UUID,
    payload: CareerGoalUpdate,
    current_user: CurrentUser,
    service: CareerServiceDep,
) -> CareerGoalRead:
    """Update an existing career goal owned by the current student."""
    return await service.update_goal(current_user, goal_id, payload)


@router.delete(
    "/{goal_id}",
    response_model=MessageResponse,
    summary="Delete career goal",
    responses=_ERROR_RESPONSES,
)
async def delete_goal(
    goal_id: UUID,
    current_user: CurrentUser,
    service: CareerServiceDep,
) -> MessageResponse:
    """Soft-delete a career goal owned by the current student."""
    await service.delete_goal(current_user, goal_id)
    return MessageResponse(message="Career goal deleted")
