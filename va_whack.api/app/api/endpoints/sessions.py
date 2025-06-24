# ==============================================================================
# This file defines the API endpoints related to game sessions.
# This includes submitting a completed game session for analysis.
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ... import schemas
from ...repository import player as player_repo, session as session_repo

from ...db.session import get_db

router = APIRouter()

def calculate_visual_acuity(trials: List[schemas.TrialData]) -> float:
    """Calculates acuity score. A simple placeholder for now."""
    successful_stimuli = [t.stimulus_size for t in trials if t.success]
    if not successful_stimuli:
        return 2.0
    return min(successful_stimuli)

@router.post("/submit", response_model=schemas.SessionResult)
def submit_game_session(session_in: schemas.SessionCreate, db: Session = Depends(get_db)):
    player = player_repo.get_by_id(db, player_id=session_in.player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    if not player.is_verified:
        raise HTTPException(status_code=403, detail="Player is not verified")

    final_score = calculate_visual_acuity(session_in.trials)

    new_session = session_repo.create(db=db, session_in=session_in, calculated_logmar=final_score)

    return schemas.SessionResult(
        session_id=new_session.id,
        player_id=new_session.player_id,
        calculated_logmar=new_session.calculated_logmar,
        message="Session processed successfully."
    )