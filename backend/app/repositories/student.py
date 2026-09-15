"""Student repository."""

from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.student import Student
from app.repositories.base import BaseRepository


class StudentRepository(BaseRepository[Student]):
    """Data access for academic student profiles."""

    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Student)

    async def get_by_user_id(self, user_id: uuid.UUID) -> Student | None:
        """Return the non-deleted student profile for ``user_id``."""
        stmt = (
            select(Student)
            .where(
                Student.user_id == user_id,
                Student.deleted_at.is_(None),
            )
            .options(selectinload(Student.user))
        )
        return await self.session.scalar(stmt)

    async def get_active_by_id(self, student_id: uuid.UUID) -> Student | None:
        """Return a non-deleted student by primary key."""
        stmt = select(Student).where(
            Student.id == student_id,
            Student.deleted_at.is_(None),
        )
        return await self.session.scalar(stmt)

    async def enrollment_exists(
        self,
        enrollment_number: str,
        *,
        exclude_id: uuid.UUID | None = None,
    ) -> bool:
        """Return ``True`` if enrollment number is already taken."""
        stmt = (
            select(func.count())
            .select_from(Student)
            .where(
                func.lower(Student.enrollment_number) == enrollment_number.lower(),
                Student.deleted_at.is_(None),
            )
        )
        if exclude_id is not None:
            stmt = stmt.where(Student.id != exclude_id)
        count = await self.session.scalar(stmt)
        return bool(count and count > 0)

    async def create_profile(
        self,
        *,
        user_id: uuid.UUID,
        enrollment_number: str,
        **fields: object,
    ) -> Student:
        """Insert a new student profile."""
        student = Student(
            user_id=user_id,
            enrollment_number=enrollment_number,
            **fields,
        )
        return await self.add(student)
