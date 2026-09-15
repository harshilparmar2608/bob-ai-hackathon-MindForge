"""Application logging configuration."""

from __future__ import annotations

import logging
import sys
from typing import Literal

from app.core.config import settings

_CONFIGURED = False


def setup_logging(
    *,
    level: str | None = None,
    log_format: Literal["json", "text"] | None = None,
) -> None:
    """
    Configure root application logging once.

    Uses a structured-ish single-line format suitable for container logs.
    """
    global _CONFIGURED
    if _CONFIGURED:
        return

    resolved_level = (level or settings.log_level).upper()
    resolved_format = log_format or settings.log_format

    if resolved_format == "json":
        fmt = (
            '{"time":"%(asctime)s","level":"%(levelname)s",'
            '"logger":"%(name)s","message":"%(message)s"}'
        )
    else:
        fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%dT%H:%M:%S%z"))

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(resolved_level)

    # Quiet noisy third-party loggers in production.
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.database_echo else logging.WARNING
    )

    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    """Return a named logger under the CampusPilot namespace."""
    setup_logging()
    return logging.getLogger(name)
