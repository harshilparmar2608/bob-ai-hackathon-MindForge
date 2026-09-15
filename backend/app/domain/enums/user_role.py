"""Domain enumerations for user roles."""

from __future__ import annotations

from enum import Enum


class UserRole(str, Enum):
    """Authorized CampusPilot user roles."""

    STUDENT = "student"
    FACULTY = "faculty"
    ADVISOR = "advisor"
    ADMIN = "admin"


__all__ = ["UserRole"]
