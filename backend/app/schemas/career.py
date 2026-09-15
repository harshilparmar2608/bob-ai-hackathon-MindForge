"""Career goal Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CareerGoalBase(BaseModel):
    """Shared career goal fields."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=64)
    target_date: Optional[date] = None
    is_achieved: bool = False
    achieved_date: Optional[date] = None
    skills_required: Optional[str] = None

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Title is required")
        return cleaned


class CareerGoalCreate(CareerGoalBase):
    """Create a career goal."""


class CareerGoalUpdate(BaseModel):
    """Partial career goal update."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(default=None, max_length=64)
    target_date: Optional[date] = None
    is_achieved: Optional[bool] = None
    achieved_date: Optional[date] = None
    skills_required: Optional[str] = None


class CareerGoalRead(CareerGoalBase):
    """Career goal response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
