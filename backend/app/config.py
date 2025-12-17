"""Configuration management"""
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # MCP URLs
    MVAE_MCP_URL: str = "http://localhost:8765"
    GEMINI_MCP_URL: str = "http://localhost:8766"

    # API Keys
    ANTHROPIC_API_KEY: str
    OPENAI_API_KEY: Optional[str] = None
    PERPLEXITY_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str

    # Storage
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    S3_BUCKET: str = "aiphdwriter-books"

    # App
    ENVIRONMENT: str = "production"
    API_BASE_URL: str = "https://api.k9appbuilder.com"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
