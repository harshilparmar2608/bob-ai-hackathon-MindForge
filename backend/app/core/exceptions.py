"""Application-level exception hierarchy."""

from __future__ import annotations

from typing import Any


class AppException(Exception):
    """Base exception for expected, client-facing application errors."""

    def __init__(
        self,
        message: str,
        *,
        code: str = "app_error",
        status_code: int = 400,
        details: Any = None,
    ) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class NotFoundError(AppException):
    """Resource was not found."""

    def __init__(
        self,
        message: str = "Resource not found",
        *,
        code: str = "not_found",
        details: Any = None,
    ) -> None:
        super().__init__(message, code=code, status_code=404, details=details)


class ConflictError(AppException):
    """Request conflicts with current resource state (e.g. duplicate email)."""

    def __init__(
        self,
        message: str = "Conflict",
        *,
        code: str = "conflict",
        details: Any = None,
    ) -> None:
        super().__init__(message, code=code, status_code=409, details=details)


class UnauthorizedError(AppException):
    """Authentication failed or credentials are missing/invalid."""

    def __init__(
        self,
        message: str = "Not authenticated",
        *,
        code: str = "unauthorized",
        details: Any = None,
    ) -> None:
        super().__init__(message, code=code, status_code=401, details=details)


class ForbiddenError(AppException):
    """Authenticated user lacks permission for the requested action."""

    def __init__(
        self,
        message: str = "Insufficient permissions",
        *,
        code: str = "forbidden",
        details: Any = None,
    ) -> None:
        super().__init__(message, code=code, status_code=403, details=details)


class ValidationAppError(AppException):
    """Business-rule validation failed."""

    def __init__(
        self,
        message: str = "Validation error",
        *,
        code: str = "validation_error",
        details: Any = None,
    ) -> None:
        super().__init__(message, code=code, status_code=422, details=details)


class BadRequestError(AppException):
    """Malformed or semantically invalid request."""

    def __init__(
        self,
        message: str = "Bad request",
        *,
        code: str = "bad_request",
        details: Any = None,
    ) -> None:
        super().__init__(message, code=code, status_code=400, details=details)
