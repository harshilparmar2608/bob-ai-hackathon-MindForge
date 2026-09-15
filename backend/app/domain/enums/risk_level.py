"""Assignment / exam risk classification."""

from __future__ import annotations

from enum import Enum


class RiskLevel(str, Enum):
    """Academic risk classification."""

    CRITICAL = "critical"
    HIGH = "high"
    MODERATE = "moderate"
    SAFE = "safe"


__all__ = ["RiskLevel"]
