# ==============================================================================
# app\services\analysis_strategies\scale_mode_strategy.py
# ==============================================================================

from .base_strategy import AnalysisStrategy
from typing import List, Dict, Any, Optional
from ... import schemas
from collections import defaultdict, deque


class ScaleModeStrategy(AnalysisStrategy):

    # Calculates the final visual acuity (VA) score from a log of responses
    # using the principles of the ETDRS-Fast algorithm.
    def analyze(self, session_data: schemas.VAScaleGameSessionCreate) -> Dict[str, Any]:
        
        # Access the log data from the provided session object.
        log_data = session_data.logEntries
        
        if not log_data:
            return {"best_va": None, "n": 0, "b": 0, "final_va": None}
        
        va_best = None # logMAR value of the best line
        final_va = None 
        b = 0 # number of correct answers below the best line
        n = 0 # number of mistakes on the best line

                # Group entries by logmar
        grouped_by_logmar = defaultdict(list)
        for entry in log_data:
            logmar = round(entry.logmar, 6)
            grouped_by_logmar[logmar].append(entry)

        # Sort logMAR values from high to low
        sorted_logmars = sorted(grouped_by_logmar.keys(), reverse=True)

        # Step 1: Try to find best_va
        for logmar in sorted_logmars:
            responses = grouped_by_logmar[logmar]
            count_can_see = sum(1 for r in responses if r.user_response == 'I can see')
            if count_can_see >= 3:
                va_best = logmar
                break

        if va_best is not None:
            # Step 2: Count mistakes on best line
            b = sum(1 for r in grouped_by_logmar[va_best] if r.user_response == "I can't see")

            # Step 3: Count 'I can see' responses below the best line
            for logmar in sorted_logmars:
                if logmar < va_best:
                    n += sum(1 for r in grouped_by_logmar[logmar] if r.user_response == "I can see")

        else:
            # If best_va cannot be determined
            va_best = round(log_data[-1].logmar, 6)
            b = 0
            n = 0

        # Step 4: Final VA calculation
        final_va = ((va_best - (0.02 * n)) + (0.02 * b))

        return {
            "best_va": round(va_best, 2),
            "n": n,
            "b": b,
            "final_va": round(final_va, 2)
             }
 