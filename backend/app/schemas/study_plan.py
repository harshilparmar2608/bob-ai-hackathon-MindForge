"""Study plan Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.domain.enums.assignment_status import AssignmentStatus


class StudyPlanBase(BaseModel):
    """Shared study plan fields."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_hours: float = Field(default=0.0, ge=0.0)
    logged_hours: float = Field(default=0.0, ge=0.0)
    status: AssignmentStatus = AssignmentStatus.TODO
    progress: int = Field(default=0, ge=0, le=100)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Title is required")
        return cleaned

    @model_validator(mode="after")
    def validate_dates(self) -> "StudyPlanBase":
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("start_date cannot be after end_date")
        return self


class StudyPlanCreate(StudyPlanBase):
    """Create a study plan, optionally linked to a subject."""

    subject_id: Optional[uuid.UUID] = None


class StudyPlanUpdate(BaseModel):
    """Partial study plan update."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    target_hours: Optional[float] = Field(default=None, ge=0.0)
    logged_hours: Optional[float] = Field(default=None, ge=0.0)
    status: Optional[AssignmentStatus] = None
    progress: Optional[int] = Field(default=None, ge=0, le=100)
    subject_id: Optional[uuid.UUID] = None


class StudyPlanRead(StudyPlanBase):
    """Study plan response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    subject_id: Optional[uuid.UUID] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
