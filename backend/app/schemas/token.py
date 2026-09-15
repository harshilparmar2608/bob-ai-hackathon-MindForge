"""JWT / token Pydantic schemas."""

from __future__ import annotations

from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    """Access + refresh token pair returned by auth endpoints."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(
        ...,
        description="Access token lifetime in seconds",
        ge=1,
    )


class RefreshTokenRequest(BaseModel):
    """Body for exchanging a refresh token for a new token pair."""

    refresh_token: str = Field(..., min_length=1)


class TokenPayload(BaseModel):
    """Decoded JWT claims (internal use)."""

    sub: str
    type: str
    role: str | None = None
    exp: int | None = None
    iat: int | None = None
