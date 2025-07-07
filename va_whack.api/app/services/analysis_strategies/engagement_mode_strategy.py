from .base_strategy import AnalysisStrategy
from typing import Dict, Optional
from ... import schemas
import statistics

class EngagementModeStrategy(AnalysisStrategy):
    def analyze(self, session_data: schemas.EngagementGameSessionCreate) -> schemas.EngagementScoreSummary:

        events = session_data.events
        total_trials = len(events)
        mole_trials = [e for e in events if e.target_type == 'mole']
        rabbit_trials = [e for e in events if e.target_type == 'rabbit']
        hits = [e for e in mole_trials if e.was_hit]
        misses = len(mole_trials) - len(hits)

        # 1. Detection Speed (mean reaction time of hit moles)
        reaction_times = [
            e.click_time - e.appear_time
            for e in hits
            if e.click_time is not None and e.appear_time is not None
        ]
        detection_speed = round(statistics.mean(reaction_times), 2) if reaction_times else None

        # 2. Detection Accuracy (mean distance from center for hits)
        dists = [e.distance_from_center for e in hits if e.distance_from_center is not None]
        detection_accuracy = round(statistics.mean(dists), 2) if dists else None

        # 3. Spatial Uniformity
        quadrant_times = {}
        for q in ['Q1', 'Q2', 'Q3', 'Q4']:
            q_times = [
                e.click_time - e.appear_time
                for e in hits
                if e.quadrant == q and e.click_time is not None and e.appear_time is not None
            ]
            if q_times:
                quadrant_times[q] = statistics.mean(q_times)

        if len(quadrant_times) >= 2:
            delta = max(quadrant_times.values()) - min(quadrant_times.values())
            spatial_uniformity = round((1 - min(delta / 100, 1)) * 100, 2)
        else:
            spatial_uniformity = None

        # 4. Sensitivity Threshold (logMAR placeholder = 1.0)
        logmar_hits: Dict[float, list] = {}
        for e in mole_trials:
            logmar = 1.0
            logmar_hits.setdefault(logmar, []).append(e.was_hit)

        valid_logmars = [
            logmar
            for logmar, outcomes in logmar_hits.items()
            if outcomes and (sum(o for o in outcomes if o) / len(outcomes)) >= 0.75
        ]
        if valid_logmars:
            c = min(valid_logmars)
            sensitivity_threshold = round((1 - (c - 0.0) / (1.0 - 0.0)) * 100, 2)
        else:
            sensitivity_threshold = None

        # 5. False Positive Rate
        distractor_clicks = len([e for e in rabbit_trials if e.was_distractor_clicked])
        false_positive_rate = round((distractor_clicks / len(rabbit_trials)) * 100, 2) if rabbit_trials else None

        # 6. Miss Rate
        miss_rate = round((misses / len(mole_trials)) * 100, 2) if mole_trials else None

        # 7. Click Validity
        clicks = [e for e in events if e.clicked]
        valid_clicks = [e for e in clicks if e.was_hit]
        click_validity = round((len(valid_clicks) / len(clicks)) * 100, 2) if clicks else None

        # 8. Trial Consistency
        rt_values = [
            e.click_time - e.appear_time
            for e in events
            if e.click_time is not None and e.appear_time is not None
        ]
        trial_consistency = round(statistics.pstdev(rt_values), 2) if rt_values else 0.0

        # 9. Max Hit Streak
        sorted_trials = sorted(events, key=lambda x: x.id)
        max_streak = streak = 0
        for e in sorted_trials:
            if e.target_type == 'mole' and e.was_hit:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 0

        # 10. Coordination Proxy
        coordination_proxy = (
            round(0.5 * (1 - detection_speed / 1000) * 100 + 0.5 * detection_accuracy, 2)
            if detection_speed is not None and detection_accuracy is not None else None
        )

        # 11. Target Discrimination
        true_hits = len(hits)
        correct_ignores = len([e for e in rabbit_trials if not e.was_distractor_clicked])
        target_discrimination = (
            round((true_hits + correct_ignores) / total_trials * 100, 2)
            if total_trials > 0 else None
        )

        # 12. VAfinal
        VAfinal = round(1.0 + 0.1 - 0.02 * len(hits), 2) if hits else None

        return schemas.EngagementScoreSummary(
            detection_speed=detection_speed,
            detection_accuracy=detection_accuracy,
            spatial_uniformity=spatial_uniformity,
            sensitivity_threshold=sensitivity_threshold,
            false_positive_rate=false_positive_rate,
            miss_rate=miss_rate,
            click_validity=click_validity,
            trial_consistency=trial_consistency,
            max_hit_streak=max_streak,
            coordination_proxy=coordination_proxy,
            target_discrimination=target_discrimination,
            VAfinal=VAfinal,
            total_trials=total_trials,
            total_mole_trials=len(mole_trials),
            total_fake_trials=len(rabbit_trials)
        )
