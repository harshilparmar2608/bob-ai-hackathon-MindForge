"""Pydantic schemas for the AI chat feature."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AiMessage(BaseModel):
    """A single message in an AI conversation."""

    role: Literal["user", "assistant"] = Field(
        ..., description="Who sent this message"
    )
    content: str = Field(..., min_length=1, description="Message text")


class AiUsage(BaseModel):
    """Token usage for a single AI response."""

    input_tokens: int = 0
    output_tokens: int = 0


class AiChatRequest(BaseModel):
    """Request body for the AI chat endpoint."""

    messages: list[AiMessage] = Field(
        ...,
        min_length=1,
        description="Conversation history ending with a user message",
    )
    max_tokens: int = Field(default=1024, ge=1, le=4096)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)


class AiChatResponse(BaseModel):
    """Response body from the AI chat endpoint."""

    reply: AiMessage
    model_id: str = ""
    usage: AiUsage = Field(default_factory=AiUsage)


class AiStatusResponse(BaseModel):
    """Reports whether the AI backend is available and which model is active."""

    enabled: bool
    model_id: str
    status: Literal["online", "mock", "offline"]
    message: str
