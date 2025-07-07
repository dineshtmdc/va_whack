# ==============================================================================
# This file defines the API endpoints for submitting different game sessions.
# ==============================================================================
from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from io import BytesIO
from sqlalchemy.orm import Session, joinedload
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from ... import schemas, models
from ...repository import scale_game as scale_game_repo, engagement_game as engagement_game_repo
from ...db.session import get_db
from ...services import analysis_service, report_service, email_service
from ..dependencies import get_current_player
import datetime

router = APIRouter()


@router.get("/download_report", response_class=StreamingResponse)
def generate_and_download_ai_report_with_scores(
    master_session_id: str,
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player),
):
    """Generates AI summary and game scores and returns as a downloadable PDF."""

    ai_summary = __generate_ai_report(current_player, master_session_id, db)

    scale_game = db.query(models.VAScaleGameSession).filter_by(
        player_id=current_player.id,
        master_session_id=master_session_id,
    ).first()

    engagement_games = db.query(models.EngagementGameSession).filter_by(
        player_id=current_player.id,
        master_session_id=master_session_id,
    ).all()

    scale_score = scale_game.score if scale_game and scale_game.score else None
    difficulty_levels = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"]

    # Build PDF using Platypus
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title and Player Info
    story.append(Paragraph("👁️<b>Vision Test Report</b>👁️", styles['Title']))
    story.append(Paragraph(f"<b>Player:</b> {current_player.name}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Scale Game Summary
    story.append(Paragraph("🔍 <b>Visual Acuity Scale Game</b>", styles['Heading2']))
    story.append(Paragraph(f"Final logMAR: {scale_score.final_va if scale_score else 'N/A'}", styles['Normal']))
    story.append(Paragraph(f"Best logMAR: {scale_score.best_va if scale_score else 'N/A'}", styles['Normal']))
    story.append(Paragraph(f"Steps Taken: {scale_score.n if scale_score else 'N/A'}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Engagement Game Scores
    story.append(Paragraph("🎯 <b>Engagement Game Results</b>", styles['Heading2']))
    for i, game in enumerate(engagement_games[:5]):
        score = game.score
        if not score:
            continue
        level = difficulty_levels[i] if i < len(difficulty_levels) else f"Level {i+1}"
        story.append(Spacer(1, 6))
        story.append(Paragraph(f"<b>{level}</b>", styles['Heading3']))
        story.append(Paragraph(f"Detection Speed (SS1): {score.detection_speed}", styles['Normal']))
        story.append(Paragraph(f"Detection Accuracy (SS2): {score.detection_accuracy}", styles['Normal']))
        story.append(Paragraph(f"Spatial Uniformity (SS3): {score.spatial_uniformity}", styles['Normal']))
        story.append(Paragraph(f"Sensitivity Threshold (SS4): {score.sensitivity_threshold}", styles['Normal']))
        story.append(Paragraph(f"False Positive Rate (SS5): {score.false_positive_rate}", styles['Normal']))
        story.append(Paragraph(f"Miss Rate (SS6): {score.miss_rate}", styles['Normal']))
        story.append(Paragraph(f"Click Validity (SS7): {score.click_validity}", styles['Normal']))
        story.append(Paragraph(f"Trial Consistency (SS8): {score.trial_consistency}", styles['Normal']))
        story.append(Paragraph(f"Max Hit Streak (SS9): {score.max_hit_streak}", styles['Normal']))
        story.append(Paragraph(f"Coordination Proxy (SS10): {score.coordination_proxy}", styles['Normal']))
        story.append(Paragraph(f"Target Discrimination (SS11): {score.target_discrimination}", styles['Normal']))
        story.append(Paragraph(f"VA Final Score: {score.va_final}", styles['Normal']))
        story.append(Spacer(1, 6))

    # AI Summary Section
    story.append(Spacer(1, 12))
    story.append(Paragraph("📝 <b>AI Summary</b>", styles['Heading2']))
    for line in ai_summary.split('\n'):
        if line.strip():
            story.append(Paragraph(line.strip(), styles['Normal']))

    # Finalize PDF
    doc.build(story)
    buffer.seek(0)

    filename = f"vision_report_{current_player.name.replace(' ', '_')}_{datetime.date.today()}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

# Generate and email AI summary report
@router.get("/email_report", response_model=None)
def generate_and_email_ai_report(
    master_session_id: str,
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player),
):
    """Generates AI summary and emails it to the player."""
    ai_summary = __generate_ai_report(current_player, master_session_id, db)

    scale_game = db.query(models.VAScaleGameSession).filter_by(
        player_id=current_player.id,
        master_session_id=master_session_id,
    ).first()

    engagement_games = db.query(models.EngagementGameSession).filter_by(
        player_id=current_player.id,
        master_session_id=master_session_id,
    ).all()

    print(f"AI Summary for {current_player.name}: {ai_summary}")
    email_service.send_summary_report(
        current_player.email, current_player.name, ai_summary, scale_game, engagement_games
    )
    return {"message": "Email sent successfully"}


# Internal helper for generating AI report
def __generate_ai_report(
    current_player: models.Player,
    master_session_id: str,
    db: Session,
) -> str:
    scale_game = db.query(models.VAScaleGameSession).filter_by(
        player_id=current_player.id,
        master_session_id=master_session_id,
    ).first()

    engagement_games = db.query(models.EngagementGameSession).filter_by(
        player_id=current_player.id,
        master_session_id=master_session_id,
    ).all()

    return report_service.generate_ai_summary(current_player, scale_game, engagement_games)


# Submit VA scale game session
@router.post("/va-scale-game/submit", response_model=schemas.ScaleGameScore)
def submit_va_scale_game(
    session_data: schemas.VAScaleGameSessionCreate,
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player),
):
    
    strategy = analysis_service.get_analysis_strategy("va_scale_mode")

    analysis_results = strategy.analyze(session_data)

    session_data.score = analysis_results # algorithm claculate results set for saving

    scale_game_repo.save_data_into_db( db, player_id=current_player.id, session_data=session_data )

    return analysis_results


# Submit Engagement game session
@router.post("/engagement-game/submit", response_model=schemas.EngagementScoreSummary)
def submit_engagement_game(
    session_data: schemas.EngagementGameSessionCreate,
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player),
):
    strategy = analysis_service.get_analysis_strategy("engagement_mode")

    analysis_results = strategy.analyze(session_data)

    session_data.scores = analysis_results # algorithm claculate results set for saving 
    
    engagement_game_repo.save_data_into_db(db, player_id=current_player.id, session_data=session_data) 
                                             
    return analysis_results


# Retrieve full game session history for current player
@router.get("/get-game-history", response_model=schemas.GameHistoryResponse)
def get_session_history(
    db: Session = Depends(get_db),
    current_player: models.Player = Depends(get_current_player),

):

    # Load VA Scale Game Sessions with config, score, and log entries

    scale_games = db.query(models.VAScaleGameSession).filter_by(player_id=current_player.id).options(

        joinedload(models.VAScaleGameSession.config),

        joinedload(models.VAScaleGameSession.score),

        joinedload(models.VAScaleGameSession.log_entries),

    ).all()
 
    # Load Engagement Game Sessions with config, score, and events

    engagement_games = db.query(models.EngagementGameSession).filter_by(player_id=current_player.id).options(

        joinedload(models.EngagementGameSession.config),

        joinedload(models.EngagementGameSession.score),

        joinedload(models.EngagementGameSession.events),

    ).all()
 
    # Transform into response model

    return schemas.GameHistoryResponse.from_orm_models(

        scale_games=scale_games,

        engagement_games=engagement_games,

        email=current_player.email

    )
 