"""Application settings loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
import os
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for CampusPilot backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "CampusPilot"
    app_env: Literal["development", "staging", "production", "test"] = "development"
    app_debug: bool = True
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 1
    reload: bool = True

    # Security
    secret_key: str = "change-me-to-a-long-random-string-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    @field_validator("secret_key")
    @classmethod
    def require_real_secret(cls, value: str) -> str:
        """Refuse the placeholder secret when running in production."""
        insecure = (
            not value
            or "change-me" in value.lower()
            or len(value) < 32
        )
        if insecure and cls._env().lower() == "production":
            raise ValueError(
                "SECRET_KEY must be set to a long random value in production"
            )
        return value

    @classmethod
    def _env(cls) -> str:
        return os.getenv("APP_ENV", "development")

    # CORS
    cors_origins: list[str] | str = Field(
        default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"]
    )
    cors_allow_credentials: bool = True

    # Database
    database_url: str = "sqlite+aiosqlite:///./campuspilot.db"
    database_echo: bool = False
    database_pool_size: int = 5
    database_max_overflow: int = 10
    database_pool_pre_ping: bool = True

    # Logging
    log_level: str = "INFO"
    log_format: Literal["json", "text"] = "json"

    # IBM Granite / watsonx.ai (Primary Project AI Engine)
    granite_api_url: str = "https://us-south.ml.cloud.ibm.com"
    granite_api_key: str = ""
    granite_project_id: str = ""
    granite_model_id: str = "ibm/granite-3-8b-instruct"
    granite_timeout_seconds: int = 60
    granite_enabled: bool = True

    # Additional AI Models (Gemini, Groq, OpenAI, OpenRouter)
    gemini_api_key: str = ""
    groq_api_key: str = ""
    openai_api_key: str = ""
    openrouter_api_key: str = ""

    # Rate limiting
    rate_limit_enabled: bool = True
    rate_limit_requests_per_minute: int = 60

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []
            if raw.startswith("["):
                import json
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed]
                except Exception:
                    pass
            return [origin.strip() for origin in raw.split(",") if origin.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value]
        return ["http://localhost:5173", "http://localhost:3000"]

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")

    @property
    def is_postgres(self) -> bool:
        return self.database_url.startswith("postgresql")

    @property
    def alembic_sync_database_url(self) -> str:
        """
        Sync-compatible URL for tooling that cannot use async drivers.

        asyncpg  -> psycopg2
        aiosqlite -> sqlite
        """
        url = self.database_url
        if url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
        if url.startswith("sqlite+aiosqlite://"):
            return url.replace("sqlite+aiosqlite://", "sqlite://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()


settings = get_settings()
