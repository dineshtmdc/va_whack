# ==============================================================================
# This is the main entry point for the FastAPI application.
# It creates the FastAPI app instance, includes the main API router,
# and creates the database tables.
# va_whack.api\app\main.py
# ==============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.session import engine
from app.models.models import Base 
from .api.endpoints import players_api, auth_api, games_api
from .core.config import settings

# This will create the database tables if they don't exist
# For a production app, use Alembic for migrations instead.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vision Testing App API",
    description="API for a Vision Testing App with Gamification.",
    version="1.0.0",
    debug=True
)

# Set up CORS middleware
origins = settings.CORS_ORIGINS.split(",") if settings.CORS_ORIGINS else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the endpoint routers
app.include_router(players_api.router, prefix="/players", tags=["Players"])
app.include_router(auth_api.router, prefix="/auth", tags=["Authentication"])
app.include_router(games_api.router, prefix="/api", tags=["Games API"])


@app.get("/", tags=["Health Check"])
def read_root():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok", "message": "Welcome to the Vision Testing App API!"}
