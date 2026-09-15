"""Recommendation application service."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domain.enums.priority_level import PriorityLevel
from app.models.recommendation import Recommendation
from app.models.user import User
from app.repositories.recommendation import RecommendationRepository
from app.schemas.common import PaginatedResponse
from app.schemas.recommendation import (
    RecommendationCreate,
    RecommendationRead,
    RecommendationUpdate,
)
from app.services.student import StudentService
from app.utils.pagination import PaginationParams, build_paginated_response

logger = logging.getLogger(__name__)


class RecommendationService:
    """Use-cases for student recommendations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.recommendations = RecommendationRepository(session)
        self.students = StudentService(session)

    async def list_recommendations(
        self,
        user: User,
        pagination: PaginationParams,
        *,
        category: str | None = None,
        priority: PriorityLevel | None = None,
        unread_only: bool = False,
    ) -> PaginatedResponse[RecommendationRead]:
        """List recommendations for the current student."""
        student = await self.students.require_student_for_user(user)
        rows, total = await self.recommendations.list_for_student(
            student.id,
            offset=pagination.offset,
            limit=pagination.limit,
            category=category,
            priority=priority,
            unread_only=unread_only,
        )
        items = [RecommendationRead.model_validate(row) for row in rows]
        return build_paginated_response(items, total=total, pagination=pagination)

    async def get_recommendation(
        self, user: User, rec_id: uuid.UUID
    ) -> RecommendationRead:
        """Fetch a single recommendation owned by the current student."""
        student = await self.students.require_student_for_user(user)
        rec = await self.recommendations.get_active_by_id(rec_id, student_id=student.id)
        if rec is None:
            raise NotFoundError(
                "Recommendation not found", code="recommendation_not_found"
            )
        return RecommendationRead.model_validate(rec)

    async def create_recommendation(
        self, user: User, payload: RecommendationCreate
    ) -> RecommendationRead:
        """Create a recommendation for the current student."""
        student = await self.students.require_student_for_user(user)
        rec = Recommendation(student_id=student.id, **payload.model_dump())
        created = await self.recommendations.add(rec)
        await self.session.commit()
        await self.session.refresh(created)
        logger.info("Created recommendation id=%s student_id=%s", created.id, student.id)
        return RecommendationRead.model_validate(created)

    async def update_recommendation(
        self,
        user: User,
        rec_id: uuid.UUID,
        payload: RecommendationUpdate,
    ) -> RecommendationRead:
        """Update a recommendation (mark read / dismissed)."""
        student = await self.students.require_student_for_user(user)
        rec = await self.recommendations.get_active_by_id(rec_id, student_id=student.id)
        if rec is None:
            raise NotFoundError(
                "Recommendation not found", code="recommendation_not_found"
            )

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(rec, field, value)

        await self.session.commit()
        await self.session.refresh(rec)
        logger.info("Updated recommendation id=%s", rec.id)
        return RecommendationRead.model_validate(rec)

    async def delete_recommendation(self, user: User, rec_id: uuid.UUID) -> None:
        """Soft-delete a recommendation owned by the current student."""
        student = await self.students.require_student_for_user(user)
        rec = await self.recommendations.get_active_by_id(rec_id, student_id=student.id)
        if rec is None:
            raise NotFoundError(
                "Recommendation not found", code="recommendation_not_found"
            )

        rec.soft_delete(when=datetime.now(timezone.utc))
        await self.session.commit()
        logger.info("Soft-deleted recommendation id=%s", rec_id)


def get_recommendation_service(session: AsyncSession) -> RecommendationService:
    """Factory for FastAPI dependencies."""
    return RecommendationService(session)
