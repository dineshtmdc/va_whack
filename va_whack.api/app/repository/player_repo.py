# ==============================================================================
# This file contains data access logic for the Player model.
# The repository pattern separates database interaction from business logic.
# va_whack.api\app\repository\player_repo.py
# ==============================================================================

from sqlalchemy.orm import Session
from ..models import models
from ..schemas import schemas

# Retrieves a player from the database by their email address.
def get_by_email(db: Session, email: str):
    return db.query(models.Player).filter(models.Player.email == email).first()

# Retrieves a player from the database by their unique ID.
def get_by_id(db: Session, player_id: int):
    return db.query(models.Player).filter(models.Player.id == player_id).first()

# Creates a new player record in the database.
def create(db: Session, player: schemas.PlayerRegisterRequest):
    db_player = models.Player(**player.dict(), is_verified=False)
    db.add(db_player)
    db.commit()
    # Refresh the object to get the ID assigned by the database
    db.refresh(db_player)
    return db_player

# Updates a player's status to verified.
def verify(db: Session, player: models.Player):
    player.is_verified = True
    db.commit()
    db.refresh(player)
    return player