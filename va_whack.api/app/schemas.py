# ==============================================================================
# This file defines the Pydantic schemas for the API.
# Schemas are used for data validation, serialization, and API documentation.
# ==============================================================================

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from pydantic.alias_generators import to_camel

# ------------------------------------------------------------------------------
# Common Config
# ------------------------------------------------------------------------------
class BaseCamelModel(BaseModel):
    model_config = {
        "from_attributes": True,
        "alias_generator": to_camel,
        "populate_by_name": True,
    }

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

class PlayerRead(BaseCamelModel):
    id: int
    name: str
    email: EmailStr
    age_group: str
    is_verified: bool
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
class VAScaleGameConfig(BaseCamelModel):
    hole_size: int
    min_hole_size: int
    max_hole_size: int
    ratio: float
    inner_color: str
    outer_color: str
    bg_color: str
    hole_gap: int
    vertical_padding: int
    horizontal_padding: int
    viewing_distance_cm: int

class ScaleLogEntry(BaseCamelModel):
    timestamp: int
    outer_diameter: float
    inner_diameter: float
    ratio: float
    scale_method: str
    logmar: float
    user_response: str

class ScaleGameScore(BaseCamelModel):
    best_va: Optional[float] = Field(None, alias="bestVA")
    n: int
    b: int
    final_va: Optional[float] = Field(None, alias="finalVA")

class VAScaleGameSessionCreate(BaseCamelModel):
    email: str
    master_session_id: Optional[str]
    start_time: int
    end_time: Optional[int] = None
    config: VAScaleGameConfig
    log_entries: List[ScaleLogEntry]
    score: ScaleGameScore

# ------------------------------------------------------------------------------
# Engagement Game Schemas
# ------------------------------------------------------------------------------
class AppearanceEvent(BaseCamelModel):
    id: int
    target_type: str
    mouse_size: int
    row: int
    col: int
    quadrant: str
    appear_time: int
    clicked: bool
    click_time: Optional[int] = None
    was_hit: Optional[bool] = None
    click_x: Optional[float] = None
    click_y: Optional[float] = None
    was_distractor_clicked: Optional[bool] = None
    distance_from_center: Optional[float] = None

class EngagementGameConfig(BaseCamelModel):
    mouse_size: int
    hole_size: int
    hole_gap: int
    fake_count: int
    spawn_interval: int
    hole_color: str
    bg_color: str

class EngagementScoreSummary(BaseCamelModel):
    detection_speed: Optional[float] = Field(None, alias="SS1_detectionSpeed")
    detection_accuracy: Optional[float] = Field(None, alias="SS2_detectionAccuracy")
    spatial_uniformity: Optional[float] = Field(None, alias="SS3_spatialUniformity")
    sensitivity_threshold: Optional[float] = Field(None, alias="SS4_sensitivityThreshold")
    false_positive_rate: Optional[float] = Field(None, alias="SS5_falsePositiveRate")
    miss_rate: Optional[float] = Field(None, alias="SS6_missRate")
    click_validity: Optional[float] = Field(None, alias="SS7_clickValidity")
    trial_consistency: Optional[float] = Field(None, alias="SS8_trialConsistency")
    max_hit_streak: Optional[int] = Field(None, alias="SS9_maxHitStreak")
    coordination_proxy: Optional[float] = Field(None, alias="SS10_coordinationProxy")
    target_discrimination: Optional[float] = Field(None, alias="SS11_targetDiscrimination")
    VAfinal: Optional[float] = Field(None, alias="VAfinal")
    total_trials: int
    total_mole_trials: int
    total_fake_trials: int

class EngagementGameSessionCreate(BaseCamelModel):
    game_id: str
    email: str
    master_session_id: Optional[str]
    config: EngagementGameConfig
    events: List[AppearanceEvent]
    start_time: int
    end_time: Optional[int] = None
    scores: EngagementScoreSummary

# ------------------------------------------------------------------------------
# # Retrieve full game session history Schemas
# ------------------------------------------------------------------------------

class GameHistoryResponse(BaseModel):
    scaleGames: List[VAScaleGameSessionCreate]
    engagementGames: List[EngagementGameSessionCreate]

    @classmethod
    def from_orm_models(cls, scale_games, engagement_games, email: str):
        from datetime import datetime

        scale_game_responses = [
            VAScaleGameSessionCreate(
                email=email,
                master_session_id=game.master_session_id,
                start_time=int(game.start_time.timestamp()),
                end_time=int(game.end_time.timestamp()) if game.end_time else None,
                config=VAScaleGameConfig(
                    hole_size=game.config.hole_size,
                    min_hole_size=game.config.min_hole_size,
                    max_hole_size=game.config.max_hole_size,
                    ratio=game.config.ratio,
                    inner_color=game.config.inner_color,
                    outer_color=game.config.outer_color,
                    bg_color=game.config.bg_color,
                    hole_gap=game.config.hole_gap,
                    vertical_padding=game.config.vertical_padding,
                    horizontal_padding=game.config.horizontal_padding,
                    viewing_distance_cm=game.config.viewing_distance_cm,
                ),
                log_entries=[
                    ScaleLogEntry(
                        timestamp=int(entry.timestamp.timestamp()),
                        outer_diameter=entry.outer_diameter,
                        inner_diameter=entry.inner_diameter,
                        ratio=entry.ratio,
                        scale_method=entry.scale_method,
                        logmar=entry.logmar,
                        user_response=entry.user_response or "",
                    )
                    for entry in game.log_entries
                ],
                score=ScaleGameScore(
                best_va=game.score.best_va,
                n=game.score.n,
                b=game.score.b,
                final_va=game.score.final_va
                )
            )
            for game in scale_games
        ]

        engagement_game_responses = [
            EngagementGameSessionCreate(
                email=email,
                game_id=game.game_id,
                master_session_id=game.master_session_id,
                start_time=int(game.start_time.timestamp()),
                end_time=int(game.end_time.timestamp()) if game.end_time else None,
                config=EngagementGameConfig(
                    mouse_size=game.config.mouse_size,
                    hole_size=game.config.hole_size,
                    hole_gap=game.config.hole_gap,
                    fake_count=game.config.fake_count,
                    spawn_interval=game.config.spawn_interval,
                    hole_color=game.config.hole_color,
                    bg_color=game.config.bg_color,
                ),
                events=[
                    AppearanceEvent(
                        id=event.id,
                        target_type=event.target_type,
                        mouse_size=event.mouse_size,
                        row=event.row,
                        col=event.col,
                        quadrant=event.quadrant,
                        appear_time=int(event.appear_time.timestamp()),
                        clicked=event.clicked,
                        click_time=int(event.click_time.timestamp()) if event.click_time else None,
                        was_hit=event.was_hit,
                        click_x=event.click_x,
                        click_y=event.click_y,
                        was_distractor_clicked=event.was_distractor_clicked,
                        distance_from_center=event.distance_from_center,
                    )
                    for event in game.events
                ],
                scores=EngagementScoreSummary(
                    detection_speed=game.score.detection_speed,
                    detection_accuracy=game.score.detection_accuracy,
                    spatial_uniformity=game.score.spatial_uniformity,
                    sensitivity_threshold=game.score.sensitivity_threshold,
                    false_positive_rate=game.score.false_positive_rate,
                    miss_rate=game.score.miss_rate,
                    click_validity=game.score.click_validity,
                    trial_consistency=game.score.trial_consistency,
                    max_hit_streak=game.score.max_hit_streak,
                    coordination_proxy=game.score.coordination_proxy,
                    target_discrimination=game.score.target_discrimination,
                    VAfinal=game.score.va_final,
                    total_trials=game.score.total_trials,
                    total_mole_trials=game.score.total_mole_trials,
                    total_fake_trials=game.score.total_fake_trials,
                )
            )
            for game in engagement_games
        ]

        return cls(scaleGames=scale_game_responses, engagementGames=engagement_game_responses)
