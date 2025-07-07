# ==============================================================================
# This file is responsible for managing application-wide settings.
# It loads configuration from environment variables for security and flexibility.
# ==============================================================================

import os
from dotenv import load_dotenv
from datetime import timedelta

# Load variables from .env file for local development
load_dotenv()

# ==============================================================================
# Central settings class to hold all environment variables.
# ==============================================================================
class Settings:
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Email
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL")
    PIN_EXPIRATION_MINUTES: int = 15
    
    # AI Reporting
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", 0.6))
    OPENAI_MAX_TOKENS: int = int(os.getenv("OPENAI_MAX_TOKENS", 10000))

    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    
# Create a single, importable instance of the settings
settings = Settings()
