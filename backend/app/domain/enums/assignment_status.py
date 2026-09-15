"""Assignment workflow status enumeration."""

from __future__ import annotations

from enum import Enum


class AssignmentStatus(str, Enum):
    """Lifecycle status for an assignment."""

    TODO = "todo"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PLANNING = "planning"


__all__ = ["AssignmentStatus"]
