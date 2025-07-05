
from .base_strategy import AnalysisStrategy
from typing import Dict, Any
from ... import schemas
import statistics

class EngagementModeStrategy(AnalysisStrategy):

    def analyze(self, session_data: schemas.EngagementGameSessionCreate) -> Dict[str, Any]:
        
        events = session_data.events
        total_trials = len(events)
        mole_trials = [e for e in events if e.targetType == 'mole']
        rabbit_trials = [e for e in events if e.targetType == 'rabbit']
        hits = [e for e in mole_trials if e.wasHit]
        misses = len(mole_trials) - len(hits)

        # 1. Detection Speed (mean reaction time of hit moles)
        reaction_times = [e.clickTime - e.appearTime for e in hits if e.clickTime is not None and e.appearTime is not None]
        detection_speed = statistics.mean(reaction_times) if reaction_times else None

        # 2. Detection Accuracy — not computable without click distance
        detection_accuracy = None  # distanceFromCenter data is not available

        # 3. Spatial Uniformity
        quadrant_times = {}
        for q in ['Q1', 'Q2', 'Q3', 'Q4']:
            q_times = [
                e.clickTime - e.appearTime for e in hits
                if e.quadrant == q and e.clickTime is not None and e.appearTime is not None
            ]
            if q_times:
                quadrant_times[q] = statistics.mean(q_times)
        if len(quadrant_times) >= 2:
            delta = max(quadrant_times.values()) - min(quadrant_times.values())
            spatial_uniformity = (1 - min(delta / 100, 1)) * 100
        else:
            spatial_uniformity = None

        # 4. Sensitivity Threshold (min LogMAR where hit rate ≥ 75%)
        logmar_hits: Dict[float, list] = {}
        for e in mole_trials:
            logmar = 1.0  # fixed logMAR (or derive dynamically if available)
            logmar_hits.setdefault(logmar, []).append(e.wasHit)
        valid_logmars = [c for c, results in logmar_hits.items() if sum(results) / len(results) >= 0.75]
        if valid_logmars:
            c = min(valid_logmars)
            sensitivity_threshold = (1 - (c - 0.0) / (1.0 - 0.0)) * 100
        else:
            sensitivity_threshold = None

        # 5. False Positive Rate (clicks on rabbits)
        distractor_clicks = len([e for e in rabbit_trials if e.wasDistractorClicked])
        false_positive_rate = (distractor_clicks / len(rabbit_trials)) * 100 if rabbit_trials else None

        # 6. Miss Rate
        miss_rate = (misses / len(mole_trials)) * 100 if mole_trials else None

        # 7. Click Validity (how many clicks were valid hits)
        clicks = [e for e in events if e.clicked]
        valid_clicks = [e for e in clicks if e.wasHit]
        click_validity = (len(valid_clicks) / len(clicks)) * 100 if clicks else None

        # 8. Trial Consistency (std dev of reaction time, not distance)
        rt_values = [e.clickTime - e.appearTime for e in events if e.clickTime is not None and e.appearTime is not None]
        rt_std = statistics.pstdev(rt_values) if rt_values else 0
        trial_consistency = rt_std  # Only reaction time stddev is available

        # 9. Max Hit Streak
        sorted_trials = sorted(events, key=lambda x: x.id)
        max_streak = streak = 0
        for e in sorted_trials:
            if e.targetType == 'mole' and e.wasHit:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 0

        # 10. Coordination Proxy (composite of ss1 and ss2)
        coordination_proxy = (
            round(0.5 * (1 - detection_speed / 1000) * 100 + 0.5 * detection_accuracy, 2)
            if detection_speed is not None and detection_accuracy is not None else None
        )

        # 11. Target Discrimination
        true_hits = len([e for e in mole_trials if e.wasHit])
        correct_ignores = len([e for e in rabbit_trials if not e.wasDistractorClicked])
        if total_trials > 0:
            target_discrimination = (true_hits + correct_ignores) / total_trials * 100
        else:
            target_discrimination = None

        # 12. VAfinal based on ETDRS
        VAfinal = round(1.0 + 0.1 - 0.02 * len(hits), 2) if hits else None

        return {
            "detectionSpeed": detection_speed,
            "detectionAccuracy": detection_accuracy,
            "spatialUniformity": spatial_uniformity,
            "sensitivityThreshold": sensitivity_threshold,
            "falsePositiveRate": false_positive_rate,
            "missRate": miss_rate,
            "clickValidity": click_validity,
            "trialConsistency": trial_consistency,
            "maxHitStreak": max_streak,
            "coordinationProxy": coordination_proxy,
            "targetDiscrimination": target_discrimination,
            "VAfinal": VAfinal,
            "totalTrials": total_trials,
            "totalMoleTrials": len(mole_trials),
            "totalRabbitTrials": len(rabbit_trials)
        }
