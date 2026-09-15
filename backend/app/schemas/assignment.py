"""Assignment Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.domain.enums.assignment_status import AssignmentStatus
from app.domain.enums.priority_level import PriorityLevel


class AssignmentBase(BaseModel):
    """Shared assignment fields."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: AssignmentStatus = AssignmentStatus.TODO
    priority: PriorityLevel = PriorityLevel.MEDIUM
    grade: Optional[float] = Field(default=None, ge=0.0)
    max_grade: Optional[float] = Field(default=None, ge=0.0)

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Title is required")
        return cleaned


class AssignmentCreate(AssignmentBase):
    """Create an assignment for a subject."""

    subject_id: Optional[uuid.UUID] = None


class AssignmentUpdate(BaseModel):
    """Partial assignment update."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[AssignmentStatus] = None
    priority: Optional[PriorityLevel] = None
    grade: Optional[float] = Field(default=None, ge=0.0)
    max_grade: Optional[float] = Field(default=None, ge=0.0)
    subject_id: Optional[uuid.UUID] = None


class AssignmentRead(AssignmentBase):
    """Assignment response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    subject_id: Optional[uuid.UUID] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
