"""Study plan application service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationAppError
from app.domain.enums.assignment_status import AssignmentStatus
from app.models.study_plan import StudyPlan
from app.models.user import User
from app.repositories.study_plan import StudyPlanRepository
from app.repositories.subject import SubjectRepository
from app.schemas.common import PaginatedResponse
from app.schemas.study_plan import StudyPlanCreate, StudyPlanRead, StudyPlanUpdate
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)


class StudyPlanService:
    """CRUD use-cases for student study plans."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.plans = StudyPlanRepository(session)
        self.subjects = SubjectRepository(session)
        self.students = StudentService(session)

    async def list_plans(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        subject_id: uuid.UUID | None = None,
        status: AssignmentStatus | None = None,
    ) -> PaginatedResponse[StudyPlanRead]:
        """List study plans for the current student."""
        student = await self.students.require_student_for_user(user)
        rows, total = await self.plans.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            subject_id=subject_id,
            status=status,
        )
        items = [self._to_read(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_plan(self, user: User, plan_id: uuid.UUID) -> StudyPlanRead:
        """Fetch a single study plan owned by the current student."""
        student = await self.students.require_student_for_user(user)
        plan = await self.plans.get_active_by_id(plan_id, student_id=student.id)
        if plan is None:
            raise NotFoundError("Study plan not found", code="study_plan_not_found")
        return self._to_read(plan)

    async def create_plan(self, user: User, payload: StudyPlanCreate) -> StudyPlanRead:
        """Create a study plan for the current student."""
        student = await self.students.require_student_for_user(user)

        if payload.subject_id is not None:
            subject = await self.subjects.get_active_by_id(
                payload.subject_id, student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        data = payload.model_dump()
        plan = StudyPlan(student_id=student.id, **data)
        created = await self.plans.add(plan)
        await self.session.commit()
        created = await self.plans.get_active_by_id(created.id, student_id=student.id)
        assert created is not None
        logger.info("Created study plan id=%s student_id=%s", created.id, student.id)
        return self._to_read(created)

    async def update_plan(
        self,
        user: User,
        plan_id: uuid.UUID,
        payload: StudyPlanUpdate,
    ) -> StudyPlanRead:
        """Update a study plan owned by the current student."""
        student = await self.students.require_student_for_user(user)
        plan = await self.plans.get_active_by_id(plan_id, student_id=student.id)
        if plan is None:
            raise NotFoundError("Study plan not found", code="study_plan_not_found")

        data = payload.model_dump(exclude_unset=True)

        if "subject_id" in data and data["subject_id"] is not None:
            subject = await self.subjects.get_active_by_id(
                data["subject_id"], student_id=student.id
            )
            if subject is None:
                raise NotFoundError("Subject not found", code="subject_not_found")

        start = data.get("start_date", plan.start_date)
        end = data.get("end_date", plan.end_date)
        if start and end and start > end:
            raise ValidationAppError(
                "start_date cannot be after end_date",
                code="invalid_date_range",
            )

        for field, value in data.items():
            setattr(plan, field, value)

        await self.session.commit()
        refreshed = await self.plans.get_active_by_id(plan.id, student_id=student.id)
        assert refreshed is not None
        logger.info("Updated study plan id=%s", refreshed.id)
        return self._to_read(refreshed)

    async def delete_plan(self, user: User, plan_id: uuid.UUID) -> None:
        """Soft-delete a study plan owned by the current student."""
        student = await self.students.require_student_for_user(user)
        plan = await self.plans.get_active_by_id(plan_id, student_id=student.id)
        if plan is None:
            raise NotFoundError("Study plan not found", code="study_plan_not_found")

        plan.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted study plan id=%s", plan_id)

    @staticmethod
    def _to_read(p: StudyPlan) -> StudyPlanRead:
        subject = p.subject
        return StudyPlanRead(
            id=p.id,
            student_id=p.student_id,
            subject_id=p.subject_id,
            title=p.title,
            description=p.description,
            start_date=p.start_date,
            end_date=p.end_date,
            target_hours=p.target_hours,
            logged_hours=p.logged_hours,
            status=p.status,
            progress=p.progress,
            subject_code=subject.code if subject is not None else None,
            subject_name=subject.name if subject is not None else None,
            created_at=p.created_at,
            updated_at=p.updated_at,
        )


def get_study_plan_service(session: AsyncSession) -> StudyPlanService:
    """Factory for FastAPI dependencies."""
    return StudyPlanService(session)
