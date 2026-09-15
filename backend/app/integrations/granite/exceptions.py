"""Granite / watsonx.ai integration-specific exceptions."""

from __future__ import annotations


class GraniteError(Exception):
    """Base exception for all Granite integration errors."""

    def __init__(self, message: str, *, status_code: int = 500) -> None:
        self.status_code = status_code
        super().__init__(message)


class GraniteAuthError(GraniteError):
    """IAM authentication or token refresh failed."""

    def __init__(self, message: str = "IBM IAM authentication failed") -> None:
        super().__init__(message, status_code=401)


class GraniteRateLimitError(GraniteError):
    """The watsonx.ai API rate limit was exceeded."""

    def __init__(self, message: str = "Granite API rate limit exceeded") -> None:
        super().__init__(message, status_code=429)


class GraniteUnavailableError(GraniteError):
    """The watsonx.ai service is temporarily unavailable."""

    def __init__(self, message: str = "Granite service unavailable") -> None:
        super().__init__(message, status_code=503)


class GraniteTimeoutError(GraniteError):
    """Request to watsonx.ai timed out."""

    def __init__(self, message: str = "Granite request timed out") -> None:
        super().__init__(message, status_code=504)
