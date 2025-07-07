# ==============================================================================
# This file is responsible for generating AI-powered summary reports.
# ==============================================================================
from typing import List
from openai import OpenAI

from app.models import EngagementGameSession, Player, VAScaleGameSession
from ..core.config import settings


client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Uses OpenAI's GPT model to generate a user-friendly summary of the test results across all 5 levels.
def generate_ai_summary(player: Player, va_scale_game: VAScaleGameSession, engagement_games: List[EngagementGameSession]) -> str:
    if not settings.OPENAI_API_KEY:
        return "AI reporting is not configured."

    try:
        # Extract VA Scale Game data
        final_va = va_scale_game.score.final_va if va_scale_game and va_scale_game.score else "N/A"
        best_va = va_scale_game.score.best_va if va_scale_game and va_scale_game.score else "N/A"
        scale_steps = va_scale_game.score.n if va_scale_game and va_scale_game.score else "N/A"

        # Prepare Engagement Game summaries per level
        difficulty_levels = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"]
        engagement_summary_blocks = []

        for i, session in enumerate(engagement_games[:5]):
            score = session.score
            level = difficulty_levels[i] if i < len(difficulty_levels) else f"Level {i+1}"
            if not score:
                continue

            engagement_summary_blocks.append(f"""
🔹 {level}
- SS₁ Detection Speed: {score.detection_speed}
- SS₂ Detection Accuracy: {score.detection_accuracy}
- SS₃ Spatial Uniformity: {score.spatial_uniformity}
- SS₄ Sensitivity Threshold: {score.sensitivity_threshold}
- SS₅ False Positive Rate: {score.false_positive_rate}
- SS₆ Miss Rate: {score.miss_rate}
- SS₇ Click Validity: {score.click_validity}
- SS₈ Trial Consistency: {score.trial_consistency}
- SS₉ Max Hit Streak: {score.max_hit_streak}
- SS₁₀ Coordination Proxy: {score.coordination_proxy}
- SS₁₁ Target Discrimination: {score.target_discrimination}
- VA Final: {score.va_final}
""")

        engagement_summary_text = "\n".join(engagement_summary_blocks)

        # Build GPT prompt
        prompt = f"""
You are a clinically-aware AI assistant tasked with generating a friendly, structured summary report of a player's vision testing performance.

The player has completed:
- A Visual Acuity Scale Game, which outputs a final logMAR value (lower = better).
- Five Engagement Game levels, each giving scores across 11 metrics (SS₁ to SS₁₁), related to speed, accuracy, coordination, and visual focus.

---

###  Your Objective

Write a clear and encouraging summary report that includes:

---

###  1. Overall Impression
Begin with a short, high-level summary of the player's effort and performance across both games.

---

###  2. Visual Acuity Analysis (logMAR)
Interpret the VA Final logMAR score using this scale:

| logMAR       | Vision Quality       |
|--------------|----------------------|
| ≤ 0.0        | Excellent             |
| 0.1 – 0.2    | Good                  |
| 0.3 – 0.4    | Average               |
| 0.5 – 0.9    | Below Average         |
| ≥ 1.0        | Poor                  |

Explain what the player’s final logMAR ({final_va}) means in everyday terms. Mention:
- Best VA score ({best_va})
- Number of steps taken ({scale_steps})
- Any signs of fluctuation or stability

---

### 🎮 3. Engagement Game Breakdown (5 Levels)
For each level (Very Easy → Very Hard), analyze:
- How detection speed, accuracy, and consistency changed with difficulty
- Whether fatigue, distraction, or sharp drops are visible
- Any strengths (e.g., “excellent discrimination” or “low false positive rate”)

Use trend words: “stable”, “declining”, “peaked at medium”, etc.

---

###  4. Score Interpretations (SS1–SS11)

For each score, include:
- The name and purpose of the score
- The actual value from the game
- A grade based on thresholds
- A short interpretation (human-readable)

Use this grading scale:

| Grade        | Description                         |
|--------------|-------------------------------------|
| Excellent    | Top 20% performance or ideal range  |
| Good         | Above average                       |
| Average      | Within expected range               |
| Below Avg    | Needs improvement                   |
| Poor         | Significantly low or problematic    |

#### Explain each metric:

- SS1 Detection Speed: How fast targets are reacted to. Fast is better.
- SS2 Detection Accuracy: % of correct hits vs total real targets.
- SS3 Spatial Uniformity: Consistency of performance across screen space.
- SS4 Sensitivity Threshold: Ability to detect small/weak stimuli.
- SS5 False Positive Rate: % of clicks on fake (non-target) items. Lower is better.
- SS6 Miss Rate: % of real targets missed. Lower is better.
- SS7 Click Validity: Proportion of valid clicks (on actual targets).
- SS8 Trial Consistency: Steadiness in behavior across multiple rounds.
- SS9 Max Hit Streak: Longest run of correct hits without a miss.
- SS10 Coordination Proxy: Proxy for motor response control.
- SS11 Target Discrimination: Accuracy in distinguishing real from fake stimuli.

Provide one line for each score that looks like:

SS4 – Sensitivity Threshold: 0.23 → Good  
"Indicates the player reliably detected smaller stimuli under moderate difficulty."

---

###  5. Summary & Recommendations

Wrap up with:
- Key strengths
- Possible weaknesses
- Whether clinical follow-up is suggested (only if vision is Poor or many scores are low)
- Encouragement to continue tracking progress

Tone must be friendly, supportive, and non-judgmental.

---

Player Info:
- Name: {player.name}
- Age Group: {player.age_group}
- Email: {player.email}

---

Visual Acuity Scale Game:
- Final logMAR: {final_va}
- Best logMAR: {best_va}
- Scale steps taken: {scale_steps}

---

Engagement Game Performance by Level:
{engagement_summary_text}
"""

        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant who summarizes vision game results in a friendly, encouraging, and clear way."
                },
                {"role": "user", "content": prompt}
            ],
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=10000  #settings.OPENAI_MAX_TOKENS
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error generating AI summary: {e}")
        return "Could not generate an AI summary for this session."
