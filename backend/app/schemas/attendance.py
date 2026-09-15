"""Attendance Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.domain.enums.attendance_status import AttendanceStatus


class AttendanceBase(BaseModel):
    """Shared attendance fields."""

    session_date: date
    status: AttendanceStatus = AttendanceStatus.PRESENT
    notes: str | None = None
    recorded_by: str | None = Field(default=None, max_length=128)


class AttendanceCreate(AttendanceBase):
    """Create an attendance session for a subject."""

    subject_id: uuid.UUID


class AttendanceUpdate(BaseModel):
    """Partial attendance update."""

    session_date: date | None = None
    status: AttendanceStatus | None = None
    notes: str | None = None
    recorded_by: str | None = Field(default=None, max_length=128)


class AttendanceRead(AttendanceBase):
    """Attendance session response."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    student_id: uuid.UUID
    subject_id: uuid.UUID
    subject_code: str | None = None
    subject_name: str | None = None
    created_at: datetime
    updated_at: datetime


class AttendanceSubjectSummary(BaseModel):
    """Aggregated attendance stats for a single subject."""

    subject_id: uuid.UUID
    subject_code: str
    subject_name: str
    total_sessions: int = Field(ge=0)
    present_count: int = Field(ge=0)
    absent_count: int = Field(ge=0)
    late_count: int = Field(ge=0)
    excused_count: int = Field(ge=0)
    percentage: float = Field(ge=0.0, le=100.0)
    is_critical: bool = False
    color: str | None = None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def attended(self) -> int:
        """Sessions counted as attended (present + late)."""
        return self.present_count + self.late_count
