"""Career goal application service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.career import CareerGoal
from app.models.user import User
from app.repositories.career import CareerRepository
from app.schemas.career import CareerGoalCreate, CareerGoalRead, CareerGoalUpdate
from app.schemas.common import PaginatedResponse
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)


class CareerService:
    """CRUD use-cases for student career goals."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.goals = CareerRepository(session)
        self.students = StudentService(session)

    async def list_goals(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        category: str | None = None,
        achieved: bool | None = None,
    ) -> PaginatedResponse[CareerGoalRead]:
        """List career goals for the current student."""
        student = await self.students.require_student_for_user(user)
        rows, total = await self.goals.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            category=category,
            achieved=achieved,
        )
        items = [CareerGoalRead.model_validate(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_goal(self, user: User, goal_id: uuid.UUID) -> CareerGoalRead:
        """Fetch a single career goal owned by the current student."""
        student = await self.students.require_student_for_user(user)
        goal = await self.goals.get_active_by_id(goal_id, student_id=student.id)
        if goal is None:
            raise NotFoundError("Career goal not found", code="career_goal_not_found")
        return CareerGoalRead.model_validate(goal)

    async def create_goal(self, user: User, payload: CareerGoalCreate) -> CareerGoalRead:
        """Create a career goal for the current student."""
        student = await self.students.require_student_for_user(user)
        goal = CareerGoal(student_id=student.id, **payload.model_dump())
        created = await self.goals.add(goal)
        await self.session.commit()
        await self.session.refresh(created)
        logger.info("Created career goal id=%s student_id=%s", created.id, student.id)
        return CareerGoalRead.model_validate(created)

    async def update_goal(
        self,
        user: User,
        goal_id: uuid.UUID,
        payload: CareerGoalUpdate,
    ) -> CareerGoalRead:
        """Update a career goal owned by the current student."""
        student = await self.students.require_student_for_user(user)
        goal = await self.goals.get_active_by_id(goal_id, student_id=student.id)
        if goal is None:
            raise NotFoundError("Career goal not found", code="career_goal_not_found")

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(goal, field, value)

        await self.session.commit()
        await self.session.refresh(goal)
        logger.info("Updated career goal id=%s", goal.id)
        return CareerGoalRead.model_validate(goal)

    async def delete_goal(self, user: User, goal_id: uuid.UUID) -> None:
        """Soft-delete a career goal owned by the current student."""
        student = await self.students.require_student_for_user(user)
        goal = await self.goals.get_active_by_id(goal_id, student_id=student.id)
        if goal is None:
            raise NotFoundError("Career goal not found", code="career_goal_not_found")

        goal.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted career goal id=%s", goal_id)


def get_career_service(session: AsyncSession) -> CareerService:
    """Factory for FastAPI dependencies."""
    return CareerService(session)
