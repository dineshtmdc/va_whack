# ==============================================================================
# This file defines the Pydantic schemas for the API.
# Schemas are used for data validation, serialization, and API documentation.
# ==============================================================================

from pydantic import BaseModel, EmailStr
from typing import List, Optional

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
# Schema for verifying a player's PIN.
# ==============================================================================
class PinVerify(BaseModel):
    email: EmailStr
    pin: str

# ==============================================================================
# Schema for requesting a new verification PIN.
# ==============================================================================
class PinResendRequest(BaseModel):
    email: EmailStr

# ==============================================================================
# Schema representing a single trial (e.g., one mole appearance) in a game.
# ==============================================================================
class TrialData(BaseModel):
    stimulus_size: float
    success: bool
    reaction_time_ms: Optional[int]

# ==============================================================================
# Schema for submitting a completed game session's data.
# ==============================================================================
class SessionCreate(BaseModel):
    player_id: int
    trials: List[TrialData]

# ==============================================================================
# Schema for the API response after processing a game session.
# ==============================================================================
class SessionResult(BaseModel):
    session_id: int
    player_id: int
    calculated_logmar: float
    message: str