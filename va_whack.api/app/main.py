# ==============================================================================
# This is the main entry point for the FastAPI application.
# It creates the FastAPI app instance, includes the main API router,
# and creates the database tables.
# ==============================================================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db.session import engine
from . import models
from .api.endpoints import players, sessions, auth

# This will create the database tables if they don't exist
# For a production app, use Alembic for migrations instead.
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vision Testing App API",
    description="API for a Vision Testing App with Gamification.",
    version="1.0.0",
)

# Set up CORS middleware
origins = [
    "http://localhost:3000", # Common port for React dev servers
    "http://localhost:5173", # Default port for Vite dev servers
    # Add your deployed front-end URL here for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the endpoint routers
app.include_router(players.router, prefix="/players", tags=["Players"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(sessions.router, prefix="/sessions", tags=["Game Sessions"])


@app.get("/", tags=["Health Check"])
def read_root():
    """A simple health check endpoint to confirm the API is running."""
    return {"status": "ok", "message": "Welcome to the Vision Testing App API!"}
