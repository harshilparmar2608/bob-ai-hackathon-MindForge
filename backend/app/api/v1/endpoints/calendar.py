"""Calendar event HTTP endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.domain.enums.calendar_event import CalendarEventCategory, CalendarEventType
from app.schemas.calendar import CalendarEventCreate, CalendarEventRead, CalendarEventUpdate
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.services.calendar import CalendarService, get_calendar_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/calendar", tags=["Calendar"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
}


def _calendar_service(db: DbSession) -> CalendarService:
    return get_calendar_service(db)


CalendarServiceDep = Annotated[CalendarService, Depends(_calendar_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[CalendarEventRead],
    summary="List calendar events",
    responses=_ERROR_RESPONSES,
)
async def list_events(
    current_user: CurrentUser,
    service: CalendarServiceDep,
    pagination: PaginationDep,
    subject_id: Annotated[UUID | None, Query(description="Filter by subject id")] = None,
    event_type: Annotated[
        CalendarEventType | None,
        Query(description="Filter by event type"),
    ] = None,
    category: Annotated[
        CalendarEventCategory | None,
        Query(description="Filter by category"),
    ] = None,
    from_dt: Annotated[
        datetime | None,
        Query(description="Events starting on or after this datetime (ISO 8601)"),
    ] = None,
    to_dt: Annotated[
        datetime | None,
        Query(description="Events starting on or before this datetime (ISO 8601)"),
    ] = None,
) -> PaginatedResponse[CalendarEventRead]:
    """Return a paginated list of calendar events for the current student."""
    return await service.list_events(
        current_user,
        pagination,
        subject_id=subject_id,
        event_type=event_type,
        category=category,
        from_dt=from_dt,
        to_dt=to_dt,
    )


@router.get(
    "/{event_id}",
    response_model=CalendarEventRead,
    summary="Get calendar event by id",
    responses=_ERROR_RESPONSES,
)
async def get_event(
    event_id: UUID,
    current_user: CurrentUser,
    service: CalendarServiceDep,
) -> CalendarEventRead:
    """Return a single calendar event owned by the current student."""
    return await service.get_event(current_user, event_id)


@router.post(
    "",
    response_model=CalendarEventRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create calendar event",
    responses=_ERROR_RESPONSES,
)
async def create_event(
    payload: CalendarEventCreate,
    current_user: CurrentUser,
    service: CalendarServiceDep,
) -> CalendarEventRead:
    """Create a new calendar event for the current student."""
    return await service.create_event(current_user, payload)


@router.put(
    "/{event_id}",
    response_model=CalendarEventRead,
    summary="Update calendar event",
    responses=_ERROR_RESPONSES,
)
async def update_event(
    event_id: UUID,
    payload: CalendarEventUpdate,
    current_user: CurrentUser,
    service: CalendarServiceDep,
) -> CalendarEventRead:
    """Update an existing calendar event owned by the current student."""
    return await service.update_event(current_user, event_id, payload)


@router.delete(
    "/{event_id}",
    response_model=MessageResponse,
    summary="Delete calendar event",
    responses=_ERROR_RESPONSES,
)
async def delete_event(
    event_id: UUID,
    current_user: CurrentUser,
    service: CalendarServiceDep,
) -> MessageResponse:
    """Soft-delete a calendar event owned by the current student."""
    await service.delete_event(current_user, event_id)
    return MessageResponse(message="Calendar event deleted")
