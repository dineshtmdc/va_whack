# ==============================================================================
# This file defines the SQLAlchemy ORM models.
# Each class corresponds to a table in the PostgreSQL database.
# ==============================================================================

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import JSONB
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
    
    scale_game_sessions = relationship("VAScaleGameSession", back_populates="player")
    engagement_game_sessions = relationship("EngagementGameSession", back_populates="player")

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
# Represents a single VA Scale Game session.
# ==============================================================================
class VAScaleGameSession(Base):
    __tablename__ = "va_scale_game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    master_session_id = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    
    player = relationship("Player", back_populates="scale_game_sessions")
    config = relationship("VAScaleGameConfig", back_populates="session", uselist=False, cascade="all, delete-orphan")
    log_entries = relationship("ScaleLogEntry", back_populates="session", cascade="all, delete-orphan")
    score = relationship("VAScaleGameScore", back_populates="session", uselist=False, cascade="all, delete-orphan")

class VAScaleGameConfig(Base):
    __tablename__ = "va_scale_game_configs"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("va_scale_game_sessions.id"))
    hole_size = Column(Integer)
    min_hole_size = Column(Integer)
    max_hole_size = Column(Integer)
    ratio = Column(Float)
    inner_color = Column(String)
    outer_color = Column(String)
    bg_color = Column(String)
    hole_gap = Column(Integer)
    vertical_padding = Column(Integer)
    horizontal_padding = Column(Integer)
    viewing_distance_cm = Column(Integer)
    session = relationship("VAScaleGameSession", back_populates="config")

class ScaleLogEntry(Base):
    __tablename__ = "scale_log_entries"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("va_scale_game_sessions.id"))
    timestamp = Column(DateTime(timezone=True))
    outer_diameter = Column(Float)
    inner_diameter = Column(Float)
    ratio = Column(Float)
    scale_method = Column(String)
    logmar = Column(Float)
    user_response = Column(String, nullable=True)
    session = relationship("VAScaleGameSession", back_populates="log_entries")

class VAScaleGameScore(Base):
    __tablename__ = "va_scale_game_scores"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("va_scale_game_sessions.id"))
    best_va = Column(Float)
    n = Column(Integer)
    b = Column(Integer)
    final_va = Column(Float)
    session = relationship("VAScaleGameSession", back_populates="score")

# ==============================================================================
# Represents a single Engagement Game session.
# ==============================================================================
class EngagementGameSession(Base):
    __tablename__ = "engagement_game_sessions"
    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.id"))
    game_id = Column(String)
    master_session_id = Column(String, nullable=True)
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    player = relationship("Player", back_populates="engagement_game_sessions")
    config = relationship("EngagementGameConfig", back_populates="session", uselist=False, cascade="all, delete-orphan")
    events = relationship("AppearanceEvent", back_populates="session", cascade="all, delete-orphan")
    score = relationship("EngagementScoreSummary", back_populates="session", uselist=False, cascade="all, delete-orphan")

class EngagementGameConfig(Base):
    __tablename__ = "engagement_game_configs"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("engagement_game_sessions.id"))
    mouse_size = Column(Integer)
    hole_size = Column(Integer)
    hole_gap = Column(Integer)
    mouse_count = Column(Integer)
    spawn_interval = Column(Integer)
    hole_color = Column(String)
    bg_color = Column(String)
    session = relationship("EngagementGameSession", back_populates="config")

class AppearanceEvent(Base):
    __tablename__ = "appearance_events"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("engagement_game_sessions.id"))
    event_id = Column(Integer)
    target_type = Column(String)
    mouse_size = Column(Integer)
    row = Column(Integer)
    col = Column(Integer)
    quadrant = Column(String)
    appear_time = Column(DateTime(timezone=True))
    clicked = Column(Boolean)
    click_time = Column(DateTime(timezone=True), nullable=True)
    click_x = Column(Float, nullable=True)
    click_y = Column(Float, nullable=True)
    was_hit = Column(Boolean, nullable=True)
    was_distractor_clicked = Column(Boolean, nullable=True)
    session = relationship("EngagementGameSession", back_populates="events")

class EngagementScoreSummary(Base):
    __tablename__ = "engagement_score_summaries"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("engagement_game_sessions.id"))
    detection_speed = Column(Float, nullable=True)
    detection_accuracy = Column(Float, nullable=True)
    spatial_uniformity = Column(Float, nullable=True)
    sensitivity_threshold = Column(Float, nullable=True)
    false_positive_rate = Column(Float, nullable=True)
    miss_rate = Column(Float, nullable=True)
    click_validity = Column(Float, nullable=True)
    trial_consistency = Column(Float, nullable=True)
    max_hit_streak = Column(Integer, nullable=True)
    coordination_proxy = Column(Float, nullable=True)
    target_discrimination = Column(Float, nullable=True)
    va_final = Column(Float, nullable=True)
    total_trials = Column(Integer)
    total_mole_trials = Column(Integer)
    total_rabbit_trials = Column(Integer)
    session = relationship("EngagementGameSession", back_populates="score")