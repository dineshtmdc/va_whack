# ==============================================================================
# This is the main entry point for the FastAPI application.
# It creates the FastAPI app instance, includes the main API router,
# and creates the database tables.
# ==============================================================================

from fastapi import FastAPI
from .db.session import engine
from . import models
from .api.endpoints import players, sessions

# This will create the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vision Testing App API",
    description="API for a Vision Testing App with Gamification.",
    version="1.0.0",
)

# Include the endpoint routers
app.include_router(players.router, prefix="/players", tags=["Players"])
app.include_router(sessions.router, prefix="/sessions", tags=["Game Sessions"])

#  A simple health check endpoint to confirm the API is running.
@app.get("/", tags=["Health Check"])
def read_root():   
    return {"status": "ok", "message": "Welcome to the Vision Testing App API!"}
