# ==============================================================================
# This file defines the Pydantic schemas for the API.
# Schemas are used for data validation, serialization, and API documentation.
# ==============================================================================

from pydantic import BaseModel, EmailStr,Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ==============================================================================
# Schema for creating a new player.
# This Pydantic model defines the data required for a player registration request.
# ==============================================================================
class PlayerCreate(BaseModel):
    name: str
    email: EmailStr
    age_group: str

# ==============================================================================
# Schema for reading player data.
# This Pydantic model defines the data shape for API responses containing player info.
# ==============================================================================
class PlayerRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    age_group: str
    is_verified: bool

    class Config:
        from_attributes = True

# ==============================================================================
# Schema for verifying a player's initial registration PIN.
# ==============================================================================
class PinVerify(BaseModel):
    email: EmailStr
    pin: str

# ==============================================================================
# Schema for requesting a new verification PIN (for registration or login).
# ==============================================================================
class PinRequest(BaseModel):
    email: EmailStr

# ==============================================================================
# Schema for the data required to exchange a login PIN for an access token.
# ==============================================================================
class TokenRequest(BaseModel):
    email: EmailStr
    pin: str

# ==============================================================================
# Schema for the API response containing a JWT access token.
# ==============================================================================
class Token(BaseModel):
    access_token: str    
    name: str
    ageGroup: str

# ==============================================================================
# Schemas for Game Data Submission
# These are designed to match the front-end interfaces.
# ==============================================================================

# --- VA Scale Game ---
class VAScaleGameConfig(BaseModel):
    hole_size: int = Field(..., alias="holeSize")
    min_hole_size: int = Field(..., alias="minHoleSize")
    max_hole_size: int = Field(..., alias="maxHoleSize")
    hole_gap: int = Field(..., alias="holeGap")
    ratio: float
    inner_color: str = Field(..., alias="innerColor")
    outer_color: str = Field(..., alias="outerColor")
    bg_color: str = Field(..., alias="bgColor")
    horizontal_padding: int = Field(..., alias="horizontalPadding")
    vertical_padding: int = Field(..., alias="verticalPadding")
    viewing_distance_cm: int = Field(..., alias="viewingDistanceCm")


class ScaleLogEntry(BaseModel):
    timestamp: int
    outer_diameter: float = Field(..., alias="outerDiameter")
    inner_diameter: float = Field(..., alias="innerDiameter")
    ratio: float
    scale_method: str = Field(..., alias="scaleMethod")
    logmar: float
    user_response: str = Field(..., alias="userResponse")

class VAScaleGameSessionCreate(BaseModel):
    
    masterSessionId: Optional[str] 
    startTime: int
    endTime: Optional[int] = None
    config: VAScaleGameConfig
    logEntries: List[ScaleLogEntry]

class ScaleGameScore(BaseModel):
    best_va: float | None = Field(None, alias="bestVA")
    n: int
    b: int
    final_va: float | None = Field(None, alias="finalVA")
    class Config:
        populate_by_name = True
        from_attributes = True
    

# --- Engagement Game ---
class AppearanceEvent(BaseModel):
    id: int
    targetType: str
    mouseSize: int
    row: int
    col: int
    quadrant: str
    appearTime: int
    clicked: bool
    clickTime: Optional[int] = None
    wasHit: Optional[bool] = None
    clickX: Optional[float] = None
    clickY: Optional[float] = None
    wasDistractorClicked: Optional[bool] = None

class EngagementGameConfig(BaseModel):
    mouseSize: int
    holeSize: int
    holeGap: int
    mouseCount: int
    spawnInterval: int
    holeColor: str
    bgColor: str

class EngagementGameSessionCreate(BaseModel):
    gameId: str
    masterSessionId: Optional[str] 
    config: EngagementGameConfig
    events: List[AppearanceEvent]
    startTime: int
    endTime: Optional[int] = None

class EngagementScoreSummary(BaseModel):
    detectionSpeed: Optional[float] = Field(None, alias="SS1_detectionSpeed")
    detectionAccuracy: Optional[float] = Field(None, alias="SS2_detectionAccuracy")
    spatialUniformity: Optional[float] = Field(None, alias="SS3_spatialUniformity")
    sensitivityThreshold: Optional[float] = Field(None, alias="SS4_sensitivityThreshold")
    falsePositiveRate: Optional[float] = Field(None, alias="SS5_falsePositiveRate")
    missRate: Optional[float] = Field(None, alias="SS6_missRate")
    clickValidity: Optional[float] = Field(None, alias="SS7_clickValidity")
    trialConsistency: Optional[float] = Field(None, alias="SS8_trialConsistency")
    maxHitStreak: Optional[int] = Field(None, alias="SS9_maxHitStreak")
    coordinationProxy: Optional[float] = Field(None, alias="SS10_coordinationProxy")
    targetDiscrimination: Optional[float] = Field(None, alias="SS11_targetDiscrimination")
    VAfinal: Optional[float] = None
    totalTrials: int
    totalMoleTrials: int
    totalRabbitTrials: int

# --- General Session Response ---
class SessionSubmitResponse(BaseModel):
    session_id: int
    message: str

# ==============================================================================
# Schemas for returning game history to the front-end.
# These match the interfaces defined in the va_whack.web project.
# ==============================================================================
class AnalysisResultRead(BaseModel):
    calculated_data: Dict[str, Any]
    ai_summary: Optional[str] = None
    
    class Config:
        from_attributes = True

class GameSessionRead(BaseModel):
    id: int
    game_type: str
    session_timestamp: datetime
    raw_data: Dict[str, Any] # The full session data from the front-end
    analysis_result: Optional[AnalysisResultRead] = None
    
    class Config:
        from_attributes = True

class GameHistoryResponse(BaseModel):
    scaleGames: List[VAScaleGameSessionCreate]
    engagementGames: List[EngagementGameSessionCreate]
    # Add other game types here as needed
    va_okn_fast_mode: List[GameSessionRead] = []