from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "HealthSync AI Backend"

    # ── Database ──────────────────────────────────────────────────────
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "healthsync_db"

    # ── Security ──────────────────────────────────────────────────────
    # NO default value — application will refuse to start if not set in .env
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── CORS ──────────────────────────────────────────────────────────
    # Set comma-separated origins in .env, e.g.:
    #   CORS_ORIGINS=http://localhost:5173,https://app.healthsync.ai
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Compliance ────────────────────────────────────────────────────
    DATA_SOVEREIGNTY_REGION: str = "IN"

    class Config:
        env_file = ".env"
        # Allow parsing "a,b,c" string from .env into List[str]
        env_list_separator = ","


settings = Settings()
