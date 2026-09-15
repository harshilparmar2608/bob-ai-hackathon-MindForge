"""Pagination helpers for list endpoints."""

from __future__ import annotations

import math
from typing import Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel, Field

from app.schemas.common import PaginatedResponse

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Normalized page / page-size query parameters."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


def get_pagination(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginationParams:
    """FastAPI dependency extracting pagination query params."""
    return PaginationParams(page=page, page_size=page_size)


def build_paginated_response(
    items: list[T],
    *,
    total: int,
    pagination: PaginationParams,
) -> PaginatedResponse[T]:
    """Wrap a result set in the standard paginated envelope."""
    pages = math.ceil(total / pagination.page_size) if pagination.page_size else 0
    return PaginatedResponse(
        items=items,
        total=total,
        page=pagination.page,
        page_size=pagination.page_size,
        pages=pages,
    )
