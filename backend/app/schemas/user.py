"""User request/response Pydantic schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.domain.enums.user_role import UserRole


class UserBase(BaseModel):
    """Shared user fields."""

    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    """Registration payload."""

    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = UserRole.STUDENT

    @field_validator("password")
    @classmethod
    def password_strength(cls, value: str) -> str:
        if value.isspace():
            raise ValueError("Password cannot be blank")
        if not any(ch.isalpha() for ch in value):
            raise ValueError("Password must contain at least one letter")
        if not any(ch.isdigit() for ch in value):
            raise ValueError("Password must contain at least one digit")
        return value

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("Full name is required")
        return cleaned


class UserLogin(BaseModel):
    """JSON login payload."""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserUpdate(BaseModel):
    """Partial profile update (future use)."""

    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    bio: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None


class UserRead(BaseModel):
    """Public user representation returned by the API."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    bio: str | None = None
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


class UserInDB(UserRead):
    """Internal representation including the password hash."""

    hashed_password: str
