"""Pydantic schemas for the IBM Granite / watsonx.ai REST API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


# ─── Request ──────────────────────────────────────────────────────────────────


class GraniteMessage(BaseModel):
    """Single message in a chat conversation."""

    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class GraniteChatRequest(BaseModel):
    """Request body sent to the watsonx.ai text-generation endpoint."""

    model_id: str
    messages: list[GraniteMessage]
    parameters: dict[str, Any] = Field(default_factory=dict)
    project_id: str = ""


# ─── Response ─────────────────────────────────────────────────────────────────


class GraniteUsage(BaseModel):
    """Token usage reported by the model."""

    input_token_count: int = 0
    generated_token_count: int = 0


class GraniteChoice(BaseModel):
    """Single completion choice."""

    index: int = 0
    message: GraniteMessage
    finish_reason: str = "stop"


class GraniteChatResponse(BaseModel):
    """Response body returned by the watsonx.ai endpoint."""

    model_id: str = ""
    choices: list[GraniteChoice] = Field(default_factory=list)
    usage: GraniteUsage = Field(default_factory=GraniteUsage)

    @property
    def content(self) -> str:
        """Extract the first assistant message content."""
        if self.choices:
            return self.choices[0].message.content
        return ""


# ─── Token response ───────────────────────────────────────────────────────────


class IamTokenResponse(BaseModel):
    """IBM IAM OAuth token response."""

    access_token: str
    token_type: str = "Bearer"
    expires_in: int = 3600
