"""Subject (course) Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SubjectBase(BaseModel):
    """Shared subject fields."""

    code: str = Field(..., min_length=1, max_length=32)
    name: str = Field(..., min_length=1, max_length=255)
    credits: float = Field(default=3.0, ge=0.0, le=30.0)
    semester: str | None = Field(default=None, max_length=64)
    instructor_name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    color: str | None = Field(default=None, max_length=32)
    target_study_hours: float = Field(default=0.0, ge=0.0)
    logged_study_hours: float = Field(default=0.0, ge=0.0)
    sort_order: int = Field(default=0, ge=0)

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str) -> str:
        cleaned = value.strip().upper()
        if not cleaned:
            raise ValueError("Subject code is required")
        return cleaned

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Subject name is required")
        return cleaned


class SubjectCreate(SubjectBase):
    """Create a subject for the current student."""


class SubjectUpdate(BaseModel):
    """Partial subject update."""

    code: str | None = Field(default=None, min_length=1, max_length=32)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    credits: float | None = Field(default=None, ge=0.0, le=30.0)
    semester: str | None = Field(default=None, max_length=64)
    instructor_name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    color: str | None = Field(default=None, max_length=32)
    target_study_hours: float | None = Field(default=None, ge=0.0)
    logged_study_hours: float | None = Field(default=None, ge=0.0)
    sort_order: int | None = Field(default=None, ge=0)

    @field_validator("code")
    @classmethod
    def normalize_code(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip().upper()
        if not cleaned:
            raise ValueError("Subject code cannot be blank")
        return cleaned


class SubjectRead(SubjectBase):
    """Subject response model."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
