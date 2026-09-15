"""Recommendation Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.domain.enums.priority_level import PriorityLevel


class RecommendationBase(BaseModel):
    """Shared recommendation fields."""

    category: str = Field(..., min_length=1, max_length=64)
    title: str = Field(..., min_length=1, max_length=255)
    body: Optional[str] = None
    source: Optional[str] = Field(default=None, max_length=64)
    priority: PriorityLevel = PriorityLevel.MEDIUM
    is_read: bool = False
    is_dismissed: bool = False


class RecommendationCreate(RecommendationBase):
    """Create a recommendation for a student (admin / AI only)."""


class RecommendationUpdate(BaseModel):
    """Partial recommendation update (mark read / dismissed)."""

    is_read: Optional[bool] = None
    is_dismissed: Optional[bool] = None
    priority: Optional[PriorityLevel] = None


class RecommendationRead(RecommendationBase):
    """Recommendation response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
