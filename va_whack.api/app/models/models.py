# ==============================================================================
# This file defines the SQLAlchemy ORM models.
# Each class corresponds to a table in the PostgreSQL database.
# va_whack.api\app\models\models.py
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

    name = Column(String(100), index=True)

    email = Column(String(320), unique=True, index=True, nullable=False)

    age_group = Column(String(50))

    is_verified = Column(Boolean, default=False, nullable=False)
 
    scale_game_sessions = relationship("VAScaleGameSession", back_populates="player")

    engagement_game_sessions = relationship("EngagementGameSession", back_populates="player")

# ==============================================================================
# Represents a verification PIN sent to a player.
# This model defines the 'pins' table for storing verification codes.
# ==============================================================================
class PinNumber(Base):

    __tablename__ = "pins"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(320), index=True, nullable=False)

    pin = Column(String(10), nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    expires_at = Column(DateTime(timezone=True), nullable=False)

    status = Column(Enum(PinStatus), default=PinStatus.ACTIVE, nullable=False)

# ==============================================================================
# Represents a single VA Scale Game session.
# ==============================================================================
class VAScaleGame(Base):

    __tablename__ = "va_scale_game_sessions"

    id = Column(Integer, primary_key=True, index=True)

    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)

    master_session_id = Column(String(100), index=True)

    start_time = Column(DateTime(timezone=True), nullable=False)

    end_time = Column(DateTime(timezone=True))
 
    player = relationship("Player", back_populates="scale_game_sessions")

    config = relationship("VAScaleGameConfig", back_populates="session", uselist=False, cascade="all, delete-orphan")

    log_entries = relationship("ScaleLogEntry", back_populates="session", cascade="all, delete-orphan")

    score = relationship("VAScaleGameScore", back_populates="session", uselist=False, cascade="all, delete-orphan")
 
class VAScaleGameConfig(Base):

    __tablename__ = "va_scale_game_configs"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("va_scale_game_sessions.id"), nullable=False, index=True)

    hole_size = Column(Integer, nullable=False)

    min_hole_size = Column(Integer, nullable=False)

    max_hole_size = Column(Integer, nullable=False)

    ratio = Column(Float, nullable=False)

    inner_color = Column(String(20), nullable=False)

    outer_color = Column(String(20), nullable=False)

    bg_color = Column(String(20), nullable=False)

    hole_gap = Column(Integer, nullable=False)

    vertical_padding = Column(Integer, nullable=False)

    horizontal_padding = Column(Integer, nullable=False)

    viewing_distance_cm = Column(Integer, nullable=False)
 
    session = relationship("VAScaleGameSession", back_populates="config")
 
class ScaleLogEntry(Base):

    __tablename__ = "scale_log_entries"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("va_scale_game_sessions.id"), nullable=False, index=True)

    timestamp = Column(DateTime(timezone=True), nullable=False)

    outer_diameter = Column(Float, nullable=False)

    inner_diameter = Column(Float, nullable=False)

    ratio = Column(Float, nullable=False)

    scale_method = Column(String(50), nullable=False)

    logmar = Column(Float, nullable=False)

    user_response = Column(String(100))
 
    session = relationship("VAScaleGameSession", back_populates="log_entries")
 
class VAScaleGameScore(Base):

    __tablename__ = "va_scale_game_scores"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("va_scale_game_sessions.id"), nullable=False, index=True)

    best_va = Column(Float, nullable=True)

    n = Column(Integer, nullable=True)

    b = Column(Integer, nullable=True)

    final_va = Column(Float, nullable=True)
 
    session = relationship("VAScaleGameSession", back_populates="score")

# ==============================================================================
# Represents a single Engagement Game session.
# ==============================================================================
class EngagementGame(Base):

    __tablename__ = "engagement_game_sessions"

    id = Column(Integer, primary_key=True, index=True)

    player_id = Column(Integer, ForeignKey("players.id"), nullable=False, index=True)

    game_id = Column(String(100), nullable=False, index=True)

    master_session_id = Column(String(100), index=True)

    start_time = Column(DateTime(timezone=True), nullable=False)

    end_time = Column(DateTime(timezone=True))
 
    player = relationship("Player", back_populates="engagement_game_sessions")

    config = relationship("EngagementGameConfig", back_populates="session", uselist=False, cascade="all, delete-orphan")

    events = relationship("AppearanceEvent", back_populates="session", cascade="all, delete-orphan")

    score = relationship("EngagementScoreSummary", back_populates="session", uselist=False, cascade="all, delete-orphan")
 
class EngagementGameConfig(Base):

    __tablename__ = "engagement_game_configs"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("engagement_game_sessions.id"), nullable=False, index=True)

    mouse_size = Column(Integer, nullable=False)

    hole_size = Column(Integer, nullable=False)

    hole_gap = Column(Integer, nullable=False)

    fake_count = Column(Integer, nullable=False)

    spawn_interval = Column(Integer, nullable=False)

    hole_color = Column(String(20), nullable=False)

    bg_color = Column(String(20), nullable=False)
 
    session = relationship("EngagementGameSession", back_populates="config")
 
class AppearanceEvent(Base):

    __tablename__ = "appearance_events"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("engagement_game_sessions.id"), nullable=False, index=True)

    event_id = Column(Integer, nullable=False)

    target_type = Column(String(50), nullable=False)

    mouse_size = Column(Integer, nullable=False)

    row = Column(Integer, nullable=False)

    col = Column(Integer, nullable=False)

    quadrant = Column(String(10), nullable=False)

    appear_time = Column(DateTime(timezone=True), nullable=False)

    clicked = Column(Boolean, nullable=False)

    click_time = Column(DateTime(timezone=True))

    click_x = Column(Float)

    click_y = Column(Float)

    was_hit = Column(Boolean)
    
    row = Column(Integer, nullable=False)

    was_distractor_clicked = Column(Boolean)
    
    distance_from_center = Column(Float, nullable=True)
 
    session = relationship("EngagementGameSession", back_populates="events")
 
class EngagementScoreSummary(Base):

    __tablename__ = "engagement_score_summaries"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(Integer, ForeignKey("engagement_game_sessions.id"), nullable=False, index=True)

    detection_speed = Column(Float)

    detection_accuracy = Column(Float)

    spatial_uniformity = Column(Float)

    sensitivity_threshold = Column(Float)

    false_positive_rate = Column(Float)

    miss_rate = Column(Float)

    click_validity = Column(Float)

    trial_consistency = Column(Float)

    max_hit_streak = Column(Integer)

    coordination_proxy = Column(Float)

    target_discrimination = Column(Float)

    va_final = Column(Float)

    total_trials = Column(Integer, nullable=False)

    total_mole_trials = Column(Integer, nullable=False)

    total_fake_trials = Column(Integer, nullable=False)
 
    session = relationship("EngagementGameSession", back_populates="score")

 