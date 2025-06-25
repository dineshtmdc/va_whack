# ==============================================================================
# This file defines the SQLAlchemy ORM models.
# Each class corresponds to a table in the PostgreSQL database.
# ==============================================================================

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timezone
import enum

Base = declarative_base()

# ==============================================================================
# Enum for the status of a verification PIN.
# Using an Enum makes the status field type-safe and more readable.
# ==============================================================================
class PinStatus(str, enum.Enum):
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"

# ==============================================================================
# Represents a player in the database.
# This SQLAlchemy model defines the 'players' table structure.
# ==============================================================================
class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    age_group = Column(String)
    is_verified = Column(Boolean, default=False)
    
    sessions = relationship("GameSession", back_populates="player")

# ==============================================================================
# Represents a verification PIN sent to a player.
# This model defines the 'pins' table for storing verification codes.
# ==============================================================================
class PinNumber(Base):
    __tablename__ = "pins"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    pin = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True))
    status = Column(Enum(PinStatus), default=PinStatus.ACTIVE, nullable=False)

# ==============================================================================
# Represents a single game session played by a player.
# This model defines the 'game_sessions' table.
# ==============================================================================
class GameSession(Base):
    __tablename__ = "game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    session_timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    calculated_logmar = Column(Float)
    
    player = relationship("Player", back_populates="sessions")