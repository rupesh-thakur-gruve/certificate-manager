"""
CertTrack Backend Configuration.

All settings are loaded from environment variables via .env file.
Uses pydantic-settings for type-safe configuration.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ========== Application ==========
    APP_NAME: str = "CertTrack"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ========== Database ==========
    DATABASE_PATH: str = "data/certtrack.db"

    # ========== JWT Authentication ==========
    JWT_SECRET_KEY: str  # Required - no default
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ========== OpenAI / LangChain ==========
    OPENAI_API_KEY: str  # Required - no default
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_TEMPERATURE: float = 0.0
    OPENAI_MAX_TOKENS: int = 1024

    # ========== Rate Limiting ==========
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 100
    RATE_LIMIT_ENABLED: bool = True

    # ========== File Upload ==========
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"
    ALLOWED_MIME_TYPES: str = "application/pdf,image/png,image/jpeg"

    # ========== CORS ==========
    CORS_ORIGINS: str = "https://*.replit.dev,https://*.repl.co,http://localhost:3000"
    CORS_ALLOW_CREDENTIALS: bool = True

    # ========== Logging ==========
    LOG_LEVEL: str = "INFO"

    @property
    def allowed_mime_types_list(self) -> list[str]:
        """Parse comma-separated MIME types into list."""
        return [m.strip() for m in self.ALLOWED_MIME_TYPES.split(",")]

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into list."""
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def max_upload_size_bytes(self) -> int:
        """Convert MB to bytes."""
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
