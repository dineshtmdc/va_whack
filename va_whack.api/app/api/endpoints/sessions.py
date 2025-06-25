# ==============================================================================
# This file defines the API endpoints related to game sessions.
# This includes submitting a completed game session for analysis.
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt

from ... import schemas
from ... import models
from ...repository import player as player_repo, session as session_repo
from ...db.session import get_db
from ...core.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def get_current_player(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        player_id: str = payload.get("sub")
        if player_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    player = player_repo.get_by_id(db, player_id=int(player_id))
    if player is None:
        raise credentials_exception
    return player

def calculate_visual_acuity(trials: List[schemas.TrialData]) -> float:
    """Calculates acuity score. A simple placeholder for now."""
    successful_stimuli = [t.stimulus_size for t in trials if t.success]
    if not successful_stimuli:
        return 2.0
    return min(successful_stimuli)

@router.post("/submit", response_model=schemas.SessionResult)
def submit_game_session(
    session_in: schemas.SessionCreate, 
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player)
):
    final_score = calculate_visual_acuity(session_in.trials)

    new_session = session_repo.create(
        db=db, 
        player_id=current_player.id, 
        trials=session_in.trials, 
        calculated_logmar=final_score
    )

    return schemas.SessionResult(
        session_id=new_session.id,
        player_id=new_session.player_id,
        calculated_logmar=new_session.calculated_logmar,
        message="Session processed successfully."
    )