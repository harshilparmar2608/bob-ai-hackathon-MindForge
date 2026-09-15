"""AI chat application service.

Delegates to the Granite client.  All Granite-specific exceptions are caught
here and translated to domain-level AppExceptions so the HTTP layer stays
clean and consistent with the rest of the error-handling strategy.
"""

from __future__ import annotations

import logging

from app.core.exceptions import AppException, BadRequestError
from app.integrations.granite import client as granite
from app.integrations.granite.exceptions import (
    GraniteAuthError,
    GraniteError,
    GraniteRateLimitError,
    GraniteTimeoutError,
    GraniteUnavailableError,
)
from app.schemas.ai import (
    AiChatRequest,
    AiChatResponse,
    AiMessage,
    AiUsage,
)

logger = logging.getLogger(__name__)

# Maximum messages kept in context to avoid token-limit issues.
_MAX_CONTEXT_MESSAGES = 20


class AiService:
    """Use-cases for the AI chat feature."""

    async def chat(self, payload: AiChatRequest) -> AiChatResponse:
        """
        Process a chat request and return the assistant reply.

        The last ``_MAX_CONTEXT_MESSAGES`` messages are forwarded to the
        Granite client.  System prompts are injected by the client itself.

        Raises
        ------
        BadRequestError
            When the message list is empty or contains no user message.
        AppException
            When the Granite service returns a transient or credential error.
        """
        if not payload.messages:
            raise BadRequestError("Message list must not be empty")

        # Guard: must end with a user turn
        last_role = payload.messages[-1].role
        if last_role != "user":
            raise BadRequestError("The last message must have role 'user'")

        # Trim to context window
        context = payload.messages[-_MAX_CONTEXT_MESSAGES:]
        raw_messages = [{"role": m.role, "content": m.content} for m in context]

        logger.info(
            "AI chat request user_message_count=%d last_message_len=%d",
            len(context),
            len(context[-1].content),
        )

        try:
            granite_resp = await granite.chat(
                raw_messages,
                max_tokens=payload.max_tokens,
                temperature=payload.temperature,
            )
        except GraniteAuthError as exc:
            logger.error("Granite auth error: %s", exc)
            raise AppException(
                "AI service credentials are not configured. "
                "Set GRANITE_API_KEY and GRANITE_ENABLED=true in the backend .env file.",
                code="ai_not_configured",
                status_code=503,
            ) from exc
        except GraniteRateLimitError as exc:
            logger.warning("Granite rate limit: %s", exc)
            raise AppException(
                "AI service is temporarily rate-limited. Please try again in a moment.",
                code="ai_rate_limited",
                status_code=429,
            ) from exc
        except GraniteTimeoutError as exc:
            logger.warning("Granite timeout: %s", exc)
            raise AppException(
                "AI service request timed out. Please try again.",
                code="ai_timeout",
                status_code=504,
            ) from exc
        except GraniteUnavailableError as exc:
            logger.error("Granite unavailable: %s", exc)
            raise AppException(
                "AI service is currently unavailable. Please try again later.",
                code="ai_unavailable",
                status_code=503,
            ) from exc
        except GraniteError as exc:
            logger.exception("Unexpected Granite error: %s", exc)
            raise AppException(
                "An unexpected error occurred in the AI service.",
                code="ai_error",
                status_code=500,
            ) from exc

        content = granite_resp.content
        logger.info(
            "AI chat response model=%s tokens=%d",
            granite_resp.model_id,
            granite_resp.usage.generated_token_count,
        )

        return AiChatResponse(
            reply=AiMessage(role="assistant", content=content),
            model_id=granite_resp.model_id,
            usage=AiUsage(
                input_tokens=granite_resp.usage.input_token_count,
                output_tokens=granite_resp.usage.generated_token_count,
            ),
        )


def get_ai_service() -> AiService:
    """Factory for FastAPI dependency injection."""
    return AiService()
