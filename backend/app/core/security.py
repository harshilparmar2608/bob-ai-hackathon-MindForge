"""Password hashing and JWT helpers."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Literal
from uuid import UUID

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings
from app.core.exceptions import UnauthorizedError, ValidationAppError

TokenType = Literal["access", "refresh"]

# bcrypt rejects secrets longer than 72 bytes; normalize once for hash + verify.
_BCRYPT_MAX_BYTES = 72


def _password_bytes(password: str) -> bytes:
    raw = password.encode("utf-8")
    return raw[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    """
    Hash a plaintext password with bcrypt.

    Uses the ``bcrypt`` library directly (compatible with passlib bcrypt hashes)
    to avoid the known passlib + bcrypt>=4.1 ``__about__`` incompatibility.
    """
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")


def validate_password(password: str) -> None:
    """
    Enforce the password policy shared with registration.

    Rules
    -----
    - 8–128 characters
    - contains at least one letter and one digit
    - not entirely whitespace

    Raises
    ------
    ValidationAppError
        When the password fails the policy.
    """
    if len(password) < 8:
        raise ValidationAppError(
            "Password must be at least 8 characters",
            code="password_too_short",
        )
    if password.isspace():
        raise ValidationAppError("Password cannot be blank", code="password_blank")
    if not any(ch.isalpha() for ch in password):
        raise ValidationAppError(
            "Password must contain at least one letter",
            code="password_missing_letter",
        )
    if not any(ch.isdigit() for ch in password):
        raise ValidationAppError(
            "Password must contain at least one digit",
            code="password_missing_digit",
        )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return ``True`` when ``plain_password`` matches ``hashed_password``."""
    try:
        return bcrypt.checkpw(
            _password_bytes(plain_password),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False


def _create_token(
    *,
    subject: str,
    token_type: TokenType,
    expires_delta: timedelta,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(
    subject: str | UUID,
    *,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create a signed JWT access token for ``subject`` (usually user id)."""
    return _create_token(
        subject=str(subject),
        token_type="access",
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        extra_claims=extra_claims,
    )


def create_refresh_token(
    subject: str | UUID,
    *,
    extra_claims: dict[str, Any] | None = None,
) -> str:
    """Create a signed JWT refresh token for ``subject``."""
    return _create_token(
        subject=str(subject),
        token_type="refresh",
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        extra_claims=extra_claims,
    )


def decode_token(token: str, *, expected_type: TokenType | None = None) -> dict[str, Any]:
    """
    Decode and validate a JWT.

    Raises
    ------
    UnauthorizedError
        If the token is invalid, expired, or of the wrong type.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
        )
    except JWTError as exc:
        raise UnauthorizedError(
            "Invalid or expired token",
            code="invalid_token",
        ) from exc

    token_type = payload.get("type")
    if expected_type is not None and token_type != expected_type:
        raise UnauthorizedError(
            f"Expected a {expected_type} token",
            code="invalid_token_type",
        )

    subject = payload.get("sub")
    if not subject:
        raise UnauthorizedError(
            "Token subject missing",
            code="invalid_token",
        )

    return payload


def get_token_subject(token: str, *, expected_type: TokenType | None = None) -> str:
    """Return the ``sub`` claim from a validated token."""
    payload = decode_token(token, expected_type=expected_type)
    return str(payload["sub"])
