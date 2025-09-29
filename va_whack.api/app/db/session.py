# ==============================================================================
# This file is responsible for setting up and managing the database connection.
# It provides a dependency-injectable way to get a database session for each request.
# va_whack.api\app\db\session.py
# ==============================================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..core.config import settings

# Minimal changes: reduce pool_recycle, keep pool_pre_ping=True
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=15,         # keep up to 10 connections open
    max_overflow=20,      # allow 20 extra temporary connections
    pool_timeout=30,      # wait 30s before giving up on a connection
    pool_recycle=600,     # recycle connections after 10 minutes (instead of 30)
    pool_pre_ping=True    # check if connection is alive before using
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency function that yields a new database session for a single request,and ensures it's closed afterward.   
def get_db():    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
