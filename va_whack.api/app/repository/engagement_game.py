# ==============================================================================
# This file contains data access logic for the Engagement Game models.
# ==============================================================================
from sqlalchemy.orm import Session
from .. import models, schemas
from datetime import datetime, timezone


def save_data_into_db(db: Session, player_id: int, session_data: schemas.EngagementGameSessionCreate):
    # 1. Create EngagementGameSession (main session entry)
    db_session = models.EngagementGameSession(
        player_id=player_id,
        game_id=session_data.game_id,
        master_session_id=session_data.master_session_id,
        start_time=datetime.fromtimestamp(session_data.start_time / 1000, tz=timezone.utc),
        end_time=datetime.fromtimestamp(session_data.end_time / 1000, tz=timezone.utc) if session_data.end_time else None
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # 2. Create EngagementGameConfig (linked one-to-one)
    db_config = models.EngagementGameConfig(
        session_id=db_session.id,
        mouse_size=session_data.config.mouse_size,
        hole_size=session_data.config.hole_size,
        hole_gap=session_data.config.hole_gap,
        fake_count=session_data.config.fake_count,
        spawn_interval=session_data.config.spawn_interval,
        hole_color=session_data.config.hole_color,
        bg_color=session_data.config.bg_color
    )
    db.add(db_config)

    # 3. Create AppearanceEvent entries (one-to-many)
    for event in session_data.events:
        db_event = models.AppearanceEvent(
            session_id=db_session.id,
            event_id=event.id,
            target_type=event.target_type,
            mouse_size=event.mouse_size,
            row=event.row,
            col=event.col,
            quadrant=event.quadrant,
            appear_time=datetime.fromtimestamp(event.appear_time / 1000, tz=timezone.utc),
            clicked=event.clicked,
            click_time=datetime.fromtimestamp(event.click_time / 1000, tz=timezone.utc) if event.click_time else None,
            was_hit=event.was_hit,
            click_x=event.click_x,
            click_y=event.click_y,
            was_distractor_clicked=event.was_distractor_clicked
        )
        db.add(db_event)

    # 4. Create EngagementScoreSummary (one-to-one)
    score = session_data.scores
    db_score = models.EngagementScoreSummary(
        session_id=db_session.id,
        detection_speed=score.detection_speed,
        detection_accuracy=score.detection_accuracy,
        spatial_uniformity=score.spatial_uniformity,
        sensitivity_threshold=score.sensitivity_threshold,
        false_positive_rate=score.false_positive_rate,
        miss_rate=score.miss_rate,
        click_validity=score.click_validity,
        trial_consistency=score.trial_consistency,
        max_hit_streak=score.max_hit_streak,
        coordination_proxy=score.coordination_proxy,
        target_discrimination=score.target_discrimination,
        va_final=score.VAfinal,
        total_trials=score.total_trials,
        total_mole_trials=score.total_mole_trials,
        total_rabbit_trials=score.total_rabbit_trials
    )
    db.add(db_score)

    # Final commit
    db.commit()
    db.refresh(db_session)
    return db_session
