"""Subject HTTP endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, DbSession
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate
from app.services.subject import SubjectService, get_subject_service
from app.utils.pagination import PaginationParams, get_pagination

router = APIRouter(prefix="/subjects", tags=["Subjects"])

_ERROR_RESPONSES = {
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    status.HTTP_403_FORBIDDEN: {"model": ErrorResponse},
    status.HTTP_404_NOT_FOUND: {"model": ErrorResponse},
    status.HTTP_409_CONFLICT: {"model": ErrorResponse},
    status.HTTP_422_UNPROCESSABLE_ENTITY: {"model": ErrorResponse},
}


def _subject_service(db: DbSession) -> SubjectService:
    return get_subject_service(db)


SubjectServiceDep = Annotated[SubjectService, Depends(_subject_service)]
PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]


@router.get(
    "",
    response_model=PaginatedResponse[SubjectRead],
    summary="List subjects",
    responses=_ERROR_RESPONSES,
)
async def list_subjects(
    current_user: CurrentUser,
    service: SubjectServiceDep,
    pagination: PaginationDep,
    semester: Annotated[
        str | None,
        Query(description="Filter by semester label"),
    ] = None,
    search: Annotated[
        str | None,
        Query(description="Search code, name, or instructor"),
    ] = None,
) -> PaginatedResponse[SubjectRead]:
    """Return a paginated list of subjects for the current student."""
    return await service.list_subjects(
        current_user,
        pagination,
        semester=semester,
        search=search,
    )


@router.get(
    "/{subject_id}",
    response_model=SubjectRead,
    summary="Get subject by id",
    responses=_ERROR_RESPONSES,
)
async def get_subject(
    subject_id: UUID,
    current_user: CurrentUser,
    service: SubjectServiceDep,
) -> SubjectRead:
    """Return a single subject owned by the current student."""
    return await service.get_subject(current_user, subject_id)


@router.post(
    "",
    response_model=SubjectRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create subject",
    responses=_ERROR_RESPONSES,
)
async def create_subject(
    payload: SubjectCreate,
    current_user: CurrentUser,
    service: SubjectServiceDep,
) -> SubjectRead:
    """Create a new subject/course for the current student."""
    return await service.create_subject(current_user, payload)


@router.put(
    "/{subject_id}",
    response_model=SubjectRead,
    summary="Update subject",
    responses=_ERROR_RESPONSES,
)
async def update_subject(
    subject_id: UUID,
    payload: SubjectUpdate,
    current_user: CurrentUser,
    service: SubjectServiceDep,
) -> SubjectRead:
    """Update an existing subject owned by the current student."""
    return await service.update_subject(current_user, subject_id, payload)


@router.delete(
    "/{subject_id}",
    response_model=MessageResponse,
    summary="Delete subject",
    responses=_ERROR_RESPONSES,
)
async def delete_subject(
    subject_id: UUID,
    current_user: CurrentUser,
    service: SubjectServiceDep,
) -> MessageResponse:
    """Soft-delete a subject owned by the current student."""
    await service.delete_subject(current_user, subject_id)
    return MessageResponse(message="Subject deleted")
