"""Calendar event type and category enumerations."""

from __future__ import annotations

from enum import Enum


class CalendarEventType(str, Enum):
    """Concrete calendar event kinds."""

    EXAM = "exam"
    DEADLINE = "deadline"
    CAREER = "career"
    LECTURE = "lecture"
    WORKSHOP = "workshop"
    MILESTONE = "milestone"
    LAB = "lab"
    OTHER = "other"


class CalendarEventCategory(str, Enum):
    """High-level calendar grouping."""

    DEADLINE = "deadline"
    EXAM = "exam"
    CAREER = "career"
    ACADEMIC = "academic"


__all__ = ["CalendarEventCategory", "CalendarEventType"]
