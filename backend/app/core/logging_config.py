"""Centralised logging configuration for the backend."""

import logging
import sys

from app.core.config import settings


def setup_logging(*, level: str | None = None) -> None:
    """Configure root logger with a console handler and structured format.

    Call once at application startup. Idempotent.
    """
    log_level = (level or settings.LOG_LEVEL).upper()

    formatter = logging.Formatter(
        fmt="%(asctime)s  %(levelname)-8s  %(name)-24s  %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.setLevel(log_level)

    root = logging.getLogger()
    # Remove any pre-existing handlers to avoid duplicates
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(log_level)

    # Keep uvicorn access logs at INFO (don't let them spam DEBUG)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger pre-configured for the application."""
    return logging.getLogger(name)
