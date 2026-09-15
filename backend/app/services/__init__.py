"""Service package exports."""

from app.services.attendance import AttendanceService, get_attendance_service
from app.services.auth import AuthService, get_auth_service
from app.services.student import StudentService, get_student_service
from app.services.subject import SubjectService, get_subject_service

__all__ = [
    "AttendanceService",
    "AuthService",
    "StudentService",
    "SubjectService",
    "get_attendance_service",
    "get_auth_service",
    "get_student_service",
    "get_subject_service",
]
