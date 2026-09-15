"""Repository package exports."""

from app.repositories.attendance import AttendanceRepository
from app.repositories.base import BaseRepository
from app.repositories.student import StudentRepository
from app.repositories.subject import SubjectRepository
from app.repositories.user import UserRepository

__all__ = [
    "AttendanceRepository",
    "BaseRepository",
    "StudentRepository",
    "SubjectRepository",
    "UserRepository",
]
