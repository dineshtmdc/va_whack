from typing import List, Optional
from app.models import (
    VAScaleGameSession, VAScaleGameConfig, ScaleLogEntry, VAScaleGameScore,
    EngagementGameSession, EngagementGameConfig, AppearanceEvent, EngagementScoreSummary
)
from app.schemas import (  
    VAScaleGameSessionCreate,
    VAScaleGameConfig,
    ScaleLogEntry,
    ScaleGameScore,
    EngagementGameSessionCreate,
    EngagementGameConfig,
    AppearanceEvent,
    EngagementScoreSummary,
    GameHistoryResponse
)


def map_scale_game_to_schema(game: VAScaleGameSession) -> VAScaleGameSessionCreate:
    return VAScaleGameSessionCreate(
id=game.id,
        masterSessionId=game.master_session_id,
        startTime=int(game.start_time.timestamp()),
        endTime=int(game.end_time.timestamp()),
        config=VAScaleGameConfig(
            holeSize=game.config.hole_size,
            minHoleSize=game.config.min_hole_size,
            maxHoleSize=game.config.max_hole_size,
            ratio=game.config.ratio,
            innerColor=game.config.inner_color,
            outerColor=game.config.outer_color,
            bgColor=game.config.bg_color,
            holeGap=game.config.hole_gap,
            verticalPadding=game.config.vertical_padding,
            horizontalPadding=game.config.horizontal_padding,
            viewingDistanceCm=game.config.viewing_distance_cm
        ) if game.config else None,
        log_entries=[
            ScaleLogEntry(
                timestamp=int(log.timestamp.timestamp()),
                outer_diameter=log.outer_diameter,
                inner_diameter=log.inner_diameter,
                ratio=log.ratio,
                scale_method=log.scale_method,
                logmar=log.logmar,
                user_response=log.user_response
            ) for log in game.log_entries
        ],
        score=ScaleGameScore(
            best_va=game.score.best_va,
            n=game.score.n,
            b=game.score.b,
            final_va=game.score.final_va
        ) if game.score else None
    )


def map_engagement_game_to_schema(game: EngagementGameSession) -> EngagementGameSessionCreate:
    return EngagementGameSessionCreate(
        id=game.id,
        game_id=game.game_id,
        master_session_id=game.master_session_id,
        start_time=game.start_time,
        end_time=game.end_time,
        config=EngagementGameConfig(
            mouse_size=game.config.mouse_size,
            hole_size=game.config.hole_size,
            hole_gap=game.config.hole_gap,
            mouse_count=game.config.mouse_count,
            spawn_interval=game.config.spawn_interval,
            hole_color=game.config.hole_color,
            bg_color=game.config.bg_color
        ) if game.config else None,
        events=[
            AppearanceEvent(
                event_id=e.event_id,
                target_type=e.target_type,
                mouse_size=e.mouse_size,
                row=e.row,
                col=e.col,
                quadrant=e.quadrant,
                appear_time=e.appear_time,
                clicked=e.clicked,
                click_time=e.click_time,
                click_x=e.click_x,
                click_y=e.click_y,
                was_hit=e.was_hit,
                was_distractor_clicked=e.was_distractor_clicked
            ) for e in game.events
        ],
        score=EngagementScoreSummary(
            detection_speed=game.score.detection_speed,
            detection_accuracy=game.score.detection_accuracy,
            spatial_uniformity=game.score.spatial_uniformity,
            sensitivity_threshold=game.score.sensitivity_threshold,
            false_positive_rate=game.score.false_positive_rate,
            miss_rate=game.score.miss_rate,
            click_validity=game.score.click_validity,
            trial_consistency=game.score.trial_consistency,
            max_hit_streak=game.score.max_hit_streak,
            coordination_proxy=game.score.coordination_proxy,
            target_discrimination=game.score.target_discrimination,
            va_final=game.score.va_final,
            total_trials=game.score.total_trials,
            total_mole_trials=game.score.total_mole_trials,
            total_rabbit_trials=game.score.total_rabbit_trials
        ) if game.score else None
    )


def map_game_history(scale_games: List[VAScaleGameSession], engagement_games: List[EngagementGameSession]) -> GameHistoryResponse:
    return GameHistoryResponse(
        scaleGames=[map_scale_game_to_schema(g) for g in scale_games],
        engagementGames=[map_engagement_game_to_schema(g) for g in engagement_games]
    )
