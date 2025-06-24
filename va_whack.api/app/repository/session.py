
# ==============================================================================
# This file contains data access logic for the GameSession model.
# ==============================================================================

from sqlalchemy.orm import Session
from .. import models, schemas

def create(db: Session, session_in: schemas.SessionCreate, calculated_logmar: float):
    db_session = models.GameSession(
        player_id=session_in.player_id,
        calculated_logmar=calculated_logmar
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session