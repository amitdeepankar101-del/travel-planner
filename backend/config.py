"""
config.py — Application configuration loaded from environment variables.

We use pydantic-settings so every env var is type-checked and validated
at startup. If a required variable is missing, the app crashes immediately
with a clear message instead of silently misbehaving.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # OpenRouter AI
    openrouter_api_key: str = ""

    # JWT (we still generate our own tokens after validating with Supabase)
    secret_key: str = "change-me-to-a-random-secret-key-32chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # CORS
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


# Singleton — import this everywhere instead of creating new instances
settings = Settings()
