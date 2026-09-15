"""Shared Pydantic response envelopes."""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class MessageResponse(BaseModel):
    """Simple message payload."""

    message: str


class ErrorDetail(BaseModel):
    """Single error object inside an error response."""

    code: str
    message: str
    details: Any | None = None


class ErrorResponse(BaseModel):
    """Standard API error envelope."""

    error: ErrorDetail


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated list envelope for future list endpoints."""

    model_config = ConfigDict(from_attributes=True)

    items: list[T]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    pages: int = Field(ge=0)
