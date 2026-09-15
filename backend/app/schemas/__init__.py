"""Schema package exports."""

from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceRead,
    AttendanceSubjectSummary,
    AttendanceUpdate,
)
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.schemas.student import StudentProfileRead, StudentProfileUpdate
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate
from app.schemas.token import RefreshTokenRequest, TokenPayload, TokenResponse
from app.schemas.user import UserCreate, UserLogin, UserRead, UserUpdate

__all__ = [
    "AttendanceCreate",
    "AttendanceRead",
    "AttendanceSubjectSummary",
    "AttendanceUpdate",
    "ErrorResponse",
    "MessageResponse",
    "PaginatedResponse",
    "RefreshTokenRequest",
    "StudentProfileRead",
    "StudentProfileUpdate",
    "SubjectCreate",
    "SubjectRead",
    "SubjectUpdate",
    "TokenPayload",
    "TokenResponse",
    "UserCreate",
    "UserLogin",
    "UserRead",
    "UserUpdate",
]
