# ==============================================================================
# This file defines the API endpoints for submitting different game sessions.
# ==============================================================================
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from ... import schemas, models
from ...repository import scale_game as scale_game_repo, engagement_game as engagement_game_repo
from ...db.session import get_db
from ...services import analysis_service, report_service, email_service
from ..dependencies import get_current_player

router = APIRouter()

def process_and_send_report(db: Session, player: models.Player, analysis_results: dict):
    """Background task to generate AI summary and email it."""
    ai_summary = report_service.generate_ai_summary(player.name, analysis_results)
    # This part needs adjustment if we want to save the AI summary back to the specific score table
    print(f"AI Summary for {player.name}: {ai_summary}")
    email_service.send_summary_report(player.email, player.name, ai_summary)

@router.post("/va-scale-game/submit", response_model=schemas.ScaleGameScore)
def submit_va_scale_game(
    session_data: schemas.VAScaleGameSessionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player)
):
    # 1. Save the raw game data to the new structured tables
    new_session = scale_game_repo.create_full_session(
        db, player_id=current_player.id, session_data=session_data
    )
    
    # 2. Analyze the data to get the score
    strategy = analysis_service.get_analysis_strategy("va_scale_mode")
    analysis_results = strategy.analyze(session_data)
    
    # 3. Save the calculated score to its table
    scale_game_repo.save_score(db, session_id=new_session.id, score_data=analysis_results)
    
    # 4. Add the AI report generation and emailing to background tasks
    #background_tasks.add_task(process_and_send_report, db, current_player, analysis_results)
    
    return schemas.ScaleGameScore(**analysis_results) 

@router.post("/engagement-game/submit", response_model=schemas.EngagementScoreSummary)
def submit_engagement_game(
    session_data: schemas.EngagementGameSessionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player)
):
    strategy = analysis_service.get_analysis_strategy("engagement_mode")
    analysis_results = strategy.analyze(session_data)
    
    new_session = engagement_game_repo.create_full_session(
        db, player_id=current_player.id, session_data=session_data
    )
    
    engagement_game_repo.save_score(db, session_id=new_session.id, score_data=analysis_results)
    
    # background_tasks.add_task(process_and_send_report, db, current_player, analysis_results)
    
    return analysis_results

# Retrieves the complete game session history for the authenticated player.
@router.get("/get-game-history")
def get_session_history(
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player)
):

    # This needs a new repository function to fetch from the new specific tables
    scale_games = db.query(models.VAScaleGameSession).filter_by(player_id=current_player.id).all()
    engagement_games = db.query(models.EngagementGameSession).filter_by(player_id=current_player.id).all()

    return {
        "scaleGames": scale_games,
        "engagementGames": engagement_games       
    }
