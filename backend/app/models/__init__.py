"""ORM model package — import models here so metadata is registered."""

from app.models.assignment import Assignment
from app.models.attendance import Attendance
from app.models.calendar_event import CalendarEvent
from app.models.career import CareerGoal
from app.models.note import Note
from app.models.recommendation import Recommendation
from app.models.student import Student
from app.models.study_plan import StudyPlan
from app.models.subject import Subject
from app.models.user import User

__all__ = [
    "Assignment",
    "Attendance",
    "CalendarEvent",
    "CareerGoal",
    "Note",
    "Recommendation",
    "Student",
    "StudyPlan",
    "Subject",
    "User",
]
