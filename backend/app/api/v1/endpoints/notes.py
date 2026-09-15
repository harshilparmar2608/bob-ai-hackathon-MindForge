"""Notes HTTP endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate
from app.services.note import NoteService, get_note_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/notes", tags=["Notes"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
}


def _note_service(db: DbSession) -> NoteService:
    return get_note_service(db)


NoteServiceDep = Annotated[NoteService, Depends(_note_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[NoteRead],
    summary="List notes",
    responses=_ERROR_RESPONSES,
)
async def list_notes(
    current_user: CurrentUser,
    service: NoteServiceDep,
    pagination: PaginationDep,
    subject_id: Annotated[UUID | None, Query(description="Filter by subject id")] = None,
    search: Annotated[str | None, Query(description="Search title, content, or tags")] = None,
    pinned_only: Annotated[bool, Query(description="Return only pinned notes")] = False,
) -> PaginatedResponse[NoteRead]:
    """Return a paginated list of notes for the current student."""
    return await service.list_notes(
        current_user,
        pagination,
        subject_id=subject_id,
        search=search,
        pinned_only=pinned_only,
    )


@router.get(
    "/{note_id}",
    response_model=NoteRead,
    summary="Get note by id",
    responses=_ERROR_RESPONSES,
)
async def get_note(
    note_id: UUID,
    current_user: CurrentUser,
    service: NoteServiceDep,
) -> NoteRead:
    """Return a single note owned by the current student."""
    return await service.get_note(current_user, note_id)


@router.post(
    "",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create note",
    responses=_ERROR_RESPONSES,
)
async def create_note(
    payload: NoteCreate,
    current_user: CurrentUser,
    service: NoteServiceDep,
) -> NoteRead:
    """Create a new note for the current student."""
    return await service.create_note(current_user, payload)


@router.put(
    "/{note_id}",
    response_model=NoteRead,
    summary="Update note",
    responses=_ERROR_RESPONSES,
)
async def update_note(
    note_id: UUID,
    payload: NoteUpdate,
    current_user: CurrentUser,
    service: NoteServiceDep,
) -> NoteRead:
    """Update an existing note owned by the current student."""
    return await service.update_note(current_user, note_id, payload)


@router.delete(
    "/{note_id}",
    response_model=MessageResponse,
    summary="Delete note",
    responses=_ERROR_RESPONSES,
)
async def delete_note(
    note_id: UUID,
    current_user: CurrentUser,
    service: NoteServiceDep,
) -> MessageResponse:
    """Soft-delete a note owned by the current student."""
    await service.delete_note(current_user, note_id)
    return MessageResponse(message="Note deleted")
