"""Student profile application service."""

from __future__ import annotations

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError
from app.models.student import Student
from app.models.user import User
from app.repositories.student import StudentRepository
from app.schemas.student import StudentProfileRead, StudentProfileUpdate

logger = logging.getLogger(__name__)


class StudentService:
    """Use-cases for the authenticated student's academic profile."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.students = StudentRepository(session)

    async def get_or_create_profile(self, user: User) -> Student:
        """
        Return the student's profile, creating a minimal default if missing.

        Ensures every authenticated account can load ``/student/profile``.
        """
        student = await self.students.get_by_user_id(user.id)
        if student is not None:
            return student

        enrollment = f"STU-{str(user.id).split('-')[0].upper()}"
        # Avoid rare collisions on short prefix.
        suffix = 0
        candidate = enrollment
        while await self.students.enrollment_exists(candidate):
            suffix += 1
            candidate = f"{enrollment}-{suffix}"

        student = await self.students.create_profile(
            user_id=user.id,
            enrollment_number=candidate,
            major="",
            college="",
            semester="",
            current_period="",
            grad_year="",
        )
        await self.session.commit()
        await self.session.refresh(student)
        logger.info("Created default student profile user_id=%s student_id=%s", user.id, student.id)
        return student

    async def get_profile(self, user: User) -> StudentProfileRead:
        """Return the current user's academic profile."""
        student = await self.get_or_create_profile(user)
        return self._to_read(student, user)

    async def update_profile(
        self,
        user: User,
        payload: StudentProfileUpdate,
    ) -> StudentProfileRead:
        """Update mutable academic profile fields for the current user."""
        student = await self.get_or_create_profile(user)
        data = payload.model_dump(exclude_unset=True)

        if "enrollment_number" in data and data["enrollment_number"] is not None:
            enrollment = str(data["enrollment_number"]).strip()
            if await self.students.enrollment_exists(enrollment, exclude_id=student.id):
                raise ConflictError(
                    "Enrollment number is already in use",
                    code="enrollment_taken",
                )
            data["enrollment_number"] = enrollment

        for field, value in data.items():
            setattr(student, field, value)

        await self.session.commit()
        await self.session.refresh(student)
        logger.info("Updated student profile student_id=%s", student.id)
        return self._to_read(student, user)

    async def require_student_for_user(self, user: User) -> Student:
        """Return the student aggregate or raise ``NotFoundError``."""
        student = await self.students.get_by_user_id(user.id)
        if student is None:
            # Auto-provision so academic modules remain usable after register.
            return await self.get_or_create_profile(user)
        return student

    @staticmethod
    def _to_read(student: Student, user: User) -> StudentProfileRead:
        return StudentProfileRead(
            id=student.id,
            user_id=student.user_id,
            enrollment_number=student.enrollment_number,
            major=student.major,
            college=student.college,
            semester=student.semester,
            current_period=student.current_period,
            grad_year=student.grad_year,
            avatar_url=student.avatar_url,
            current_gpa=student.current_gpa,
            target_gpa=student.target_gpa,
            class_rank=student.class_rank,
            attendance_rate=student.attendance_rate,
            placement_readiness=student.placement_readiness,
            academic_health_score=student.academic_health_score,
            full_name=user.full_name,
            email=user.email,
            created_at=student.created_at,
            updated_at=student.updated_at,
        )


def get_student_service(session: AsyncSession) -> StudentService:
    """Factory for FastAPI dependencies."""
    return StudentService(session)
