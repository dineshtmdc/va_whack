# ==============================================================================
# This file contains data access logic for the Engagement Game models.
# ==============================================================================
from sqlalchemy.orm import Session
from .. import models, schemas
from datetime import datetime, timezone

def create_full_session(db: Session, player_id: int, session_data: schemas.EngagementGameSessionCreate):
    # 1. Create the main session record
    db_session = models.EngagementGameSession(
        player_id=player_id,
        game_id=session_data.gameId,
        master_session_id = session_data.masterSessionId,
        start_time=datetime.fromtimestamp(session_data.startTime / 1000, tz=timezone.utc),
        end_time=datetime.fromtimestamp(session_data.endTime / 1000, tz=timezone.utc) if session_data.endTime else None
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # 2. Create the config record
    db_config = models.EngagementGameConfig(session_id=db_session.id, **session_data.config.dict())
    db.add(db_config)
    
    # 3. Create all event records
    for event in session_data.events:
        event_data = event.dict()
        event_data['event_id'] = event_data.pop('id')
        event_data['target_type'] = event_data.pop('targetType')
        event_data['mouse_size'] = event_data.pop('mouseSize')
        event_data['appear_time'] = datetime.fromtimestamp(event_data.pop('appearTime') / 1000, tz=timezone.utc)
        event_data['click_time'] = datetime.fromtimestamp(event_data.pop('clickTime') / 1000, tz=timezone.utc) if event.clickTime else None
        event_data['click_x'] = event_data.pop('clickX')
        event_data['click_y'] = event_data.pop('clickY')
        event_data['was_hit'] = event_data.pop('wasHit')
        event_data['was_distractor_clicked'] = event_data.pop('wasDistractorClicked')
        
        db_event = models.AppearanceEvent(session_id=db_session.id, **event_data)
        db.add(db_event)

    db.commit()
    return db_session

def save_score(db: Session, session_id: int, score_data: dict):
    score_data_db = {
        "detection_speed": score_data.get("detectionSpeed"),
        "detection_accuracy": score_data.get("detectionAccuracy"),
        "spatial_uniformity": score_data.get("spatialUniformity"),
        "sensitivity_threshold": score_data.get("sensitivityThreshold"),
        "false_positive_rate": score_data.get("falsePositiveRate"),
        "miss_rate": score_data.get("missRate"),
        "click_validity": score_data.get("clickValidity"),
        "trial_consistency": score_data.get("trialConsistency"),
        "max_hit_streak": score_data.get("maxHitStreak"),
        "coordination_proxy": score_data.get("coordinationProxy"),
        "target_discrimination": score_data.get("targetDiscrimination"),
        "va_final": score_data.get("VAfinal"),
        "total_trials": score_data.get("totalTrials"),
        "total_mole_trials": score_data.get("totalMoleTrials"),
        "total_rabbit_trials": score_data.get("totalRabbitTrials"),
    }
    db_score = models.EngagementScoreSummary(session_id=session_id, **score_data_db)
    db.add(db_score)
    db.commit()
    return db_score