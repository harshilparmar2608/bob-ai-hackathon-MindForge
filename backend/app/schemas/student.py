"""Student profile Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StudentProfileBase(BaseModel):
    """Shared academic profile fields."""

    enrollment_number: str = Field(..., min_length=1, max_length=64)
    major: str = Field(default="", max_length=255)
    college: str = Field(default="", max_length=255)
    semester: str = Field(default="", max_length=64)
    current_period: str = Field(default="", max_length=64)
    grad_year: str = Field(default="", max_length=64)
    avatar_url: str | None = Field(default=None, max_length=512)
    current_gpa: float = Field(default=0.0, ge=0.0, le=4.0)
    target_gpa: float = Field(default=0.0, ge=0.0, le=4.0)
    class_rank: str | None = Field(default=None, max_length=64)
    attendance_rate: float = Field(default=0.0, ge=0.0, le=100.0)
    placement_readiness: int = Field(default=0, ge=0, le=100)
    academic_health_score: int = Field(default=0, ge=0, le=100)

    @field_validator("enrollment_number")
    @classmethod
    def normalize_enrollment(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Enrollment number is required")
        return cleaned


    @field_validator("avatar_url")
    @classmethod
    def normalize_avatar(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            return None
        if len(cleaned) > 512:
            raise ValueError("Avatar URL is too long (max 512 characters)")
        parsed = urlparse(cleaned)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("Avatar must be a valid http(s) URL")
        return cleaned


class StudentProfileUpdate(BaseModel):
    """Partial update for the authenticated student's profile."""

    enrollment_number: str | None = Field(default=None, min_length=1, max_length=64)
    major: str | None = Field(default=None, max_length=255)
    college: str | None = Field(default=None, max_length=255)
    semester: str | None = Field(default=None, max_length=64)
    current_period: str | None = Field(default=None, max_length=64)
    grad_year: str | None = Field(default=None, max_length=64)
    avatar_url: str | None = Field(default=None, max_length=512)
    current_gpa: float | None = Field(default=None, ge=0.0, le=4.0)
    target_gpa: float | None = Field(default=None, ge=0.0, le=4.0)
    class_rank: str | None = Field(default=None, max_length=64)
    attendance_rate: float | None = Field(default=None, ge=0.0, le=100.0)
    placement_readiness: int | None = Field(default=None, ge=0, le=100)
    academic_health_score: int | None = Field(default=None, ge=0, le=100)


class StudentProfileRead(StudentProfileBase):
    """Public student profile response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    full_name: str | None = None
    email: str | None = None
    created_at: datetime
    updated_at: datetime
