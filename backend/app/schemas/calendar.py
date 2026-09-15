"""Calendar event Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.domain.enums.calendar_event import CalendarEventCategory, CalendarEventType


class CalendarEventBase(BaseModel):
    """Shared calendar event fields."""

    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: CalendarEventType = CalendarEventType.OTHER
    category: CalendarEventCategory = CalendarEventCategory.ACADEMIC
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    location: Optional[str] = Field(default=None, max_length=255)
    color: Optional[str] = Field(default=None, max_length=32)
    is_all_day: bool = False

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Title is required")
        return cleaned

    @model_validator(mode="after")
    def validate_datetimes(self) -> "CalendarEventBase":
        if (
            self.end_datetime is not None
            and self.end_datetime < self.start_datetime
        ):
            raise ValueError("end_datetime cannot be before start_datetime")
        return self


class CalendarEventCreate(CalendarEventBase):
    """Create a calendar event, optionally linked to a subject."""

    subject_id: Optional[uuid.UUID] = None


class CalendarEventUpdate(BaseModel):
    """Partial calendar event update."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    event_type: Optional[CalendarEventType] = None
    category: Optional[CalendarEventCategory] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    location: Optional[str] = Field(default=None, max_length=255)
    color: Optional[str] = Field(default=None, max_length=32)
    is_all_day: Optional[bool] = None
    subject_id: Optional[uuid.UUID] = None


class CalendarEventRead(CalendarEventBase):
    """Calendar event response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    subject_id: Optional[uuid.UUID] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
