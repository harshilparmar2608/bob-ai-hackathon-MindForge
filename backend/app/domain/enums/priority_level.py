"""Shared priority levels used across academic workflow entities."""

from __future__ import annotations

from enum import Enum


class PriorityLevel(str, Enum):
    """Urgency / priority classification."""

    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


__all__ = ["PriorityLevel"]
