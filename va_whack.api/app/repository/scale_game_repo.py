# ==============================================================================
# This file contains data access logic for the VA Scale Game models.
# va_whack.api\app\repository\scale_game_repo.py
# ==============================================================================
from sqlalchemy.orm import Session
from ..models import models
from ..schemas import schemas
from datetime import datetime, timezone

def save_data_into_db(db: Session, player_id: int, session_data: schemas.VAScaleGameSubmitRequest):
    # 1. Create the main session record
    db_session = models.VAScaleGame(
        player_id=player_id,
        start_time=datetime.fromtimestamp(session_data.start_time / 1000, tz=timezone.utc),
        master_session_id=session_data.master_session_id,
        end_time=datetime.fromtimestamp(session_data.end_time / 1000, tz=timezone.utc) if session_data.end_time else None
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # 2. Create the config record
    db_config = models.VAScaleGameConfig(
        session_id=db_session.id,
        **session_data.config.model_dump(by_alias=False)
    )
    db.add(db_config)

    # 3. Create all log entry records
    for entry in session_data.log_entries:
        log_entry_data = entry.model_dump(by_alias=False)
        log_entry_data['timestamp'] = datetime.fromtimestamp(log_entry_data['timestamp'] / 1000, tz=timezone.utc)
        db_log = models.ScaleLogEntry(session_id=db_session.id, **log_entry_data)
        db.add(db_log)

    # 4. Create the score record
    score_data = session_data.score.model_dump(by_alias=False)
    db_score = models.VAScaleGameScore(session_id=db_session.id, **score_data)
    db.add(db_score)

    # 5. Commit all at once
    db.commit()

    return db_session
