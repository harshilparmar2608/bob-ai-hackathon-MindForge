"""Attendance session status enumeration."""

from __future__ import annotations

from enum import Enum


class AttendanceStatus(str, Enum):
    """Status of a single class attendance entry."""

    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


__all__ = ["AttendanceStatus"]
