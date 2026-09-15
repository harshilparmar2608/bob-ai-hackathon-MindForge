"""Note Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NoteBase(BaseModel):
    """Shared note fields."""

    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    tags: Optional[str] = Field(default=None, max_length=512)
    is_pinned: bool = False

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Title is required")
        return cleaned


class NoteCreate(NoteBase):
    """Create a note, optionally linked to a subject."""

    subject_id: Optional[uuid.UUID] = None


class NoteUpdate(BaseModel):
    """Partial note update."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    content: Optional[str] = None
    tags: Optional[str] = Field(default=None, max_length=512)
    is_pinned: Optional[bool] = None
    subject_id: Optional[uuid.UUID] = None


class NoteRead(NoteBase):
    """Note response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    subject_id: Optional[uuid.UUID] = None
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
