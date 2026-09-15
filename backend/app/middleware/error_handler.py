"""Global FastAPI exception handlers."""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppException

logger = logging.getLogger(__name__)


def _error_body(
    *,
    code: str,
    message: str,
    details: Any = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details is not None:
        body["error"]["details"] = details
    return body


async def app_exception_handler(_request: Request, exc: AppException) -> JSONResponse:
    """Serialize :class:`AppException` into a consistent error envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(code=exc.code, message=exc.message, details=exc.details),
        headers={"WWW-Authenticate": "Bearer"} if exc.status_code == 401 else None,
    )


async def http_exception_handler(
    _request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """Normalize Starlette/FastAPI HTTPException responses."""
    detail = exc.detail
    message = detail if isinstance(detail, str) else "HTTP error"
    details = detail if not isinstance(detail, str) else None
    return JSONResponse(
        status_code=exc.status_code,
        content=_error_body(code="http_error", message=message, details=details),
        headers=getattr(exc, "headers", None),
    )


async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation failed",
            "errors": [
                {
                    "field": ".".join(map(str, err["loc"][1:])),
                    "message": err["msg"],
                }
                for err in exc.errors()
            ],
        },
    )


async def unhandled_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler — never leak internal details to clients."""
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_error_body(
            code="internal_server_error",
            message="An unexpected error occurred",
        ),
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all application exception handlers to ``app``."""
    app.add_exception_handler(AppException, app_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, validation_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, unhandled_exception_handler)
