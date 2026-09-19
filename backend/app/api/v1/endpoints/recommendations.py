"""Recommendation HTTP endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.domain.enums.priority_level import PriorityLevel
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationRead,
    RecommendationUpdate,
)
from app.services.recommendation import RecommendationService, get_recommendation_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
}


def _recommendation_service(db: DbSession) -> RecommendationService:
    return get_recommendation_service(db)


RecommendationServiceDep = Annotated[RecommendationService, Depends(_recommendation_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[RecommendationRead],
    summary="List recommendations",
    responses=_ERROR_RESPONSES,
)
async def list_recommendations(
    current_user: CurrentUser,
    service: RecommendationServiceDep,
    pagination: PaginationDep,
    category: Annotated[str | None, Query(description="Filter by category")] = None,
    priority: Annotated[
        PriorityLevel | None,
        Query(description="Filter by priority"),
    ] = None,
    unread_only: Annotated[bool, Query(description="Return only unread items")] = False,
) -> PaginatedResponse[RecommendationRead]:
    """Return a paginated list of recommendations for the current student."""
    return await service.list_recommendations(
        current_user,
        pagination,
        category=category,
        priority=priority,
        unread_only=unread_only,
    )


@router.get(
    "/{rec_id}",
    response_model=RecommendationRead,
    summary="Get recommendation by id",
    responses=_ERROR_RESPONSES,
)
async def get_recommendation(
    rec_id: UUID,
    current_user: CurrentUser,
    service: RecommendationServiceDep,
) -> RecommendationRead:
    """Return a single recommendation owned by the current student."""
    return await service.get_recommendation(current_user, rec_id)


@router.post(
    "",
    response_model=RecommendationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create recommendation",
    responses=_ERROR_RESPONSES,
)
async def create_recommendation(
    payload: RecommendationCreate,
    current_user: CurrentUser,
    service: RecommendationServiceDep,
) -> RecommendationRead:
    """Create a recommendation for the current student."""
    return await service.create_recommendation(current_user, payload)


@router.patch(
    "/{rec_id}",
    response_model=RecommendationRead,
    summary="Update recommendation (mark read/dismissed)",
    responses=_ERROR_RESPONSES,
)
async def update_recommendation(
    rec_id: UUID,
    payload: RecommendationUpdate,
    current_user: CurrentUser,
    service: RecommendationServiceDep,
) -> RecommendationRead:
    """Update a recommendation — typically to mark it as read or dismissed."""
    return await service.update_recommendation(current_user, rec_id, payload)


@router.delete(
    "/{rec_id}",
    response_model=MessageResponse,
    summary="Delete recommendation",
    responses=_ERROR_RESPONSES,
)
async def delete_recommendation(
    rec_id: UUID,
    current_user: CurrentUser,
    service: RecommendationServiceDep,
) -> MessageResponse:
    """Soft-delete a recommendation owned by the current student."""
    await service.delete_recommendation(current_user, rec_id)
    return MessageResponse(message="Recommendation deleted")
