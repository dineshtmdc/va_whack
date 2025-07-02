# ==============================================================================
# This file contains data access logic for the VA Scale Game models.
# ==============================================================================
from sqlalchemy.orm import Session
from .. import models, schemas
from datetime import datetime, timezone

def create_full_session(db: Session, player_id: int, session_data: schemas.VAScaleGameSessionCreate):
    # 1. Create the main session record
    db_session = models.VAScaleGameSession(
        player_id=player_id,
        start_time=datetime.fromtimestamp(session_data.startTime / 1000, tz=timezone.utc),
        end_time=datetime.fromtimestamp(session_data.endTime / 1000, tz=timezone.utc) if session_data.endTime else None
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # 2. Create the config record
    db_config = models.VAScaleGameConfig(session_id=db_session.id, **session_data.config.model_dump())
    db.add(db_config)

    # 3. Create all log entry records
    for entry in session_data.logEntries:
        log_entry_data = entry.dict()
        log_entry_data['timestamp'] = datetime.fromtimestamp(log_entry_data['timestamp'] / 1000, tz=timezone.utc)
        db_log = models.ScaleLogEntry(session_id=db_session.id, **log_entry_data)
        db.add(db_log)

    db.commit()
    return db_session

def save_score(db: Session, session_id: int, score_data: dict):
    db_score = models.VAScaleGameScore(session_id=session_id, **score_data)
    db.add(db_score)
    db.commit()
    return db_score