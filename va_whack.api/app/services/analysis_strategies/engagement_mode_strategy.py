
from .base_strategy import AnalysisStrategy
from typing import Dict, Any
from ... import schemas

class EngagementModeStrategy(AnalysisStrategy):
    def analyze(self, session_data: schemas.EngagementGameSessionCreate) -> Dict[str, Any]:
        """
        Analysis algorithm for the "Engagement Mode" game.
        """
        total_trials = len(session_data.events)
        mole_trials = [e for e in session_data.events if e.targetType == 'mole']
        hits = [e for e in mole_trials if e.wasHit]
        misses = len(mole_trials) - len(hits)
        
        # False positives are clicks on non-mole targets
        distractor_clicks = len([e for e in session_data.events if e.targetType != 'mole' and e.clicked])
        
        return {
            "detectionSpeed": None,
            "detectionAccuracy": None,
            "spatialUniformity": None,
            "sensitivityThreshold": None,
            "falsePositiveRate": (distractor_clicks / (total_trials - len(mole_trials))) * 100 if (total_trials - len(mole_trials)) > 0 else 0,
            "missRate": (misses / len(mole_trials)) * 100 if mole_trials else 0,
            "clickValidity": None,
            "trialConsistency": None,
            "maxHitStreak": None,
            "coordinationProxy": None,
            "targetDiscrimination": None,
            "VAfinal": None,
            "totalTrials": total_trials,
            "totalMoleTrials": len(mole_trials),
            "totalRabbitTrials": total_trials - len(mole_trials)
        }