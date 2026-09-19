"""AI chat HTTP endpoints.

Provides:
    POST /ai/chat      – submit a conversation turn, receive assistant reply
    GET  /ai/status    – check whether the Granite model is live or in mock mode
"""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser
from app.core.config import settings
from app.schemas.ai import AiChatRequest, AiChatResponse, AiStatusResponse
from app.schemas.common import ErrorResponse
from app.services.ai import AiService, get_ai_service

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

_ERROR_RESPONSES = {
    status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse},
    status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
    422: {"model": ErrorResponse},
    status.HTTP_429_TOO_MANY_REQUESTS: {"model": ErrorResponse},
    status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse},
    status.HTTP_504_GATEWAY_TIMEOUT: {"model": ErrorResponse},
}

AiServiceDep = Annotated[AiService, Depends(get_ai_service)]


@router.post(
    "/chat",
    response_model=AiChatResponse,
    summary="Send a message to the AI assistant",
    description=(
        "Submit the full conversation history (ending with a `user` turn). "
        "The AI assistant returns its next reply. "
        "When `GRANITE_ENABLED=false` (default for local dev) the endpoint "
        "returns deterministic campus-aware mock responses without calling "
        "the IBM watsonx.ai API."
    ),
    responses=_ERROR_RESPONSES,
)
async def chat(
    payload: AiChatRequest,
    current_user: CurrentUser,  # noqa: ARG001 — ensures auth but not used in mock path
    service: AiServiceDep,
) -> AiChatResponse:
    """
    Process one conversation turn and return the assistant reply.

    The endpoint requires a valid Bearer token so that only authenticated
    students can access the AI feature.
    """
    return await service.chat(payload)


@router.get(
    "/status",
    response_model=AiStatusResponse,
    summary="Check AI service status",
    description=(
        "Returns whether the Granite model is running live (requires IBM credentials) "
        "or in mock mode (default for local development)."
    ),
)
async def ai_status(
    current_user: CurrentUser,  # noqa: ARG001
) -> AiStatusResponse:
    """Return the current AI service availability and active model identifier."""
    import os
    gemini_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""
    if gemini_key and gemini_key not in ("MY_GEMINI_API_KEY", "your_api_key_here", "change-me"):
        return AiStatusResponse(
            enabled=True,
            model_id="google/gemini-1.5-flash",
            status="online",
            message="Google Gemini 1.5 Flash model is active.",
        )

    groq_key = settings.groq_api_key or os.getenv("GROQ_API_KEY") or ""
    if groq_key and groq_key not in ("your_api_key_here", "change-me"):
        return AiStatusResponse(
            enabled=True,
            model_id="groq/llama-3.3-70b-versatile",
            status="online",
            message="Groq LLaMA 3.3 model is active.",
        )

    openai_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY") or ""
    if openai_key and openai_key not in ("your_api_key_here", "change-me"):
        return AiStatusResponse(
            enabled=True,
            model_id="openai/gpt-4o-mini",
            status="online",
            message="OpenAI GPT-4o mini model is active.",
        )

    if settings.granite_enabled and settings.granite_api_key:
        return AiStatusResponse(
            enabled=True,
            model_id=settings.granite_model_id or "ibm/granite-3-8b-instruct",
            status="online",
            message="IBM Granite model is active and responding.",
        )

    return AiStatusResponse(
        enabled=False,
        model_id="mock/granite-3-8b-instruct",
        status="mock",
        message=(
            "Running in mock mode. Add your API key (GEMINI_API_KEY, GROQ_API_KEY, "
            "OPENAI_API_KEY, or GRANITE_API_KEY) in backend/.env to connect a live AI model."
        ),
    )
