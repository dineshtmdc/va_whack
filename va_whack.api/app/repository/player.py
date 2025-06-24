# ==============================================================================
# This file contains data access logic for the Player model.
# The repository pattern separates database interaction from business logic.
# ==============================================================================

from sqlalchemy.orm import Session
from .. import models, schemas

def get_by_email(db: Session, email: str):
    return db.query(models.Player).filter(models.Player.email == email).first()

def get_by_id(db: Session, player_id: int):
    return db.query(models.Player).filter(models.Player.id == player_id).first()

def create(db: Session, player: schemas.PlayerCreate):
    db_player = models.Player(**player.dict(), is_verified=False)
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def verify(db: Session, player: models.Player):
    player.is_verified = True
    db.commit()
    db.refresh(player)
    return player