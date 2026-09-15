"""Exam lifecycle status."""

from __future__ import annotations

from enum import Enum


class ExamStatus(str, Enum):
    """Status of a scheduled exam."""

    UPCOMING = "upcoming"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


__all__ = ["ExamStatus"]
