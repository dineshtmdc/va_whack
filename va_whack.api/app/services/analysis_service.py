# ==============================================================================
# This file acts as a factory for creating the correct analysis strategy.
# It decouples the API endpoint from the concrete implementation of the game algorithms.
# va_whack.api\app\services\analysis_service.py
# ==============================================================================
from .analysis_strategies.base_strategy import AnalysisStrategy
from .analysis_strategies.engagement_mode_strategy import EngagementModeStrategy
from .analysis_strategies.scale_mode_strategy import ScaleModeStrategy

# A dictionary mapping game type strings to their corresponding strategy class
STRATEGY_MAP = {
    "engagement_mode": EngagementModeStrategy,
    "va_scale_mode": ScaleModeStrategy,
}

#    Factory function that returns an instance of the correct analysis strategy
#    based on the provided game_type.
def get_analysis_strategy(game_type: str) -> AnalysisStrategy | None:
    # Normalize front-end game type to match strategy keys
    normalized_game_type = game_type.lower().replace(" ", "_")
    
    strategy_class = STRATEGY_MAP.get(normalized_game_type)
    if strategy_class:
        return strategy_class()
    return None
