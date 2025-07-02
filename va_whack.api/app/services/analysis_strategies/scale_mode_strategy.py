from .base_strategy import AnalysisStrategy
from typing import Dict, Any, Optional
from ... import schemas
from collections import defaultdict

class ScaleModeStrategy(AnalysisStrategy):
    def analyze(self, session_data: schemas.VAScaleGameSessionCreate) -> Dict[str, Any]:
        """
        ETDRS-Fast algorithm implementation for VA Scale Game.
        """
        log_entries = session_data.logEntries

        # Return default values if no entries were recorded in the session
        if not log_entries:
            return {"best_va": 2.0, "n": 0, "b": 0, "final_va": 2.0}

        # Group all log entries by logMAR level (each level simulates a chart line)
        grouped = defaultdict(list)
        for entry in log_entries:
            grouped[entry.logmar].append(entry)

        # Sort the logMAR levels from easiest (top of chart) to hardest (bottom)
        sorted_logmars = sorted(grouped.keys())
        best_line: Optional[float] = None

        # Step 1: Initial descent — simulate the participant reading one letter per line
        # Proceed line-by-line until the first "I can't see" response occurs
        for i, logmar in enumerate(sorted_logmars):
            sample_entry = grouped[logmar][0]  # Use only the first entry on the line
            if sample_entry.user_response == "I can't see":
                # Once failed, jump one line up for best-line candidate
                best_line = sorted_logmars[i - 1] if i > 0 else None
                break
        else:
            # No mistake encountered; assume last line is best-line candidate
            best_line = sorted_logmars[-1]

        # Step 2: Validate best-line using full line entries:
        # - If ≥3 correct ("I can see") responses on this line: confirm as best-line
        # - If ≥2 incorrect ("I can't see") responses: move one line up
        while best_line is not None:
            best_line_entries = grouped[best_line]
            correct = sum(1 for e in best_line_entries if e.user_response == "I can see")
            mistakes = sum(1 for e in best_line_entries if e.user_response == "I can't see")

            if correct >= 3:
                # Best-line confirmed with 3+ correct responses
                break
            elif mistakes >= 2:
                # Too many mistakes — go up one more line
                idx = sorted_logmars.index(best_line)
                if idx == 0:
                    # No higher line to check — no valid best-line
                    best_line = None
                    break
                best_line = sorted_logmars[idx - 1]
            else:
                # Best-line uncertain but not disqualified — accept current
                break

        # Step 3: If best-line not found, return fallback default VA score
        if best_line is None:
            return {"best_va": 2.0, "n": 0, "b": 0, "final_va": 2.0}

        # Step 4: Count 'I can see' responses below the best-line (n)
        idx = sorted_logmars.index(best_line)
        below_logmars = sorted_logmars[idx + 1:]
        n = sum(
            1 for logmar in below_logmars
            for e in grouped[logmar]
            if e.user_response == "I can see"
        )

        # Step 5: Count mistakes ('I can't see') on the best-line (b)
        b = sum(1 for e in grouped[best_line] if e.user_response == "I can't see")

        # Step 6: Calculate final visual acuity using the ETDRS formula:
        # VAfinal = VAbest-line – 0.02n + 0.02b
        final_va = round(best_line - 0.02 * n + 0.02 * b, 3)

        # Step 7: Return final result as dictionary
        return {
            "best_va": round(best_line, 2),
            "n": n,
            "b": b,
            "final_va": round(final_va, 2),
        }
