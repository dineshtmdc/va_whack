# ==============================================================================
# This file is responsible for managing application-wide settings.
# It loads configuration from environment variables for security and flexibility.
# ==============================================================================

import os
from dotenv import load_dotenv

# Load environment variables from a .env file for local development
load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY")
    SENDER_EMAIL: str = os.getenv("SENDER_EMAIL")
    PIN_EXPIRATION_MINUTES: int = 15

settings = Settings()
