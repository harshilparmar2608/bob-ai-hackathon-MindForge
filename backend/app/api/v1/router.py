"""API v1 root router."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai,
    assignments,
    attendance,
    auth,
    calendar,
    career,
    health,
    notes,
    recommendations,
    students,
    study_plans,
    subjects,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(users.router)
api_router.include_router(ai.router)
api_router.include_router(students.router)
api_router.include_router(subjects.router)
api_router.include_router(attendance.router)
api_router.include_router(assignments.router)
api_router.include_router(notes.router)
api_router.include_router(study_plans.router)
api_router.include_router(calendar.router)
api_router.include_router(career.router)
api_router.include_router(recommendations.router)
