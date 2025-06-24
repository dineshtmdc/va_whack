# ==============================================================================
# This file is responsible for setting up and managing the database connection.
# It provides a dependency-injectable way to get a database session for each request.
# ==============================================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..core.config import settings

# Create the SQLAlchemy engine using the database URL from settings
engine = create_engine(settings.DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency function that yields a new database session for a single request,and ensures it's closed afterward.   
def get_db():    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()