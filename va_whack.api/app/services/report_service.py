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

        for i, session in enumerate(engagement_games[:5]):  # Only first 5
            score = session.score
            level = difficulty_levels[i] if i < len(difficulty_levels) else f"Level {i+1}"
            if not score:
                continue

            engagement_summary_blocks.append(f"""
🔹 **{level}**
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

        # Combine all level-wise blocks into one string
        engagement_summary_text = "\n".join(engagement_summary_blocks)

        # Build prompt
        prompt = f"""
You are a friendly and intelligent vision test assistant. Summarize this player's visual performance across the Visual Acuity Scale game and five Engagement Game levels (Very Easy to Very Hard). The player is tested on clarity, focus, coordination, and cognitive accuracy.

Your job is to:
- Provide a friendly but insightful report
- Highlight trends across difficulty levels (e.g., declining performance, stable accuracy, or fatigue)
- Offer medically-aware explanations if performance drops sharply
- Recommend vision checkups or exercises only if warranted
- Keep the tone warm and motivating

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

---

Write a short, clear narrative summary in 3–5 paragraphs. Start with overall impression, then break down acuity vs engagement, and conclude with tips and encouragement.
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
            max_tokens=settings.OPENAI_MAX_TOKENS
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        print(f"Error generating AI summary: {e}")
        return "Could not generate an AI summary for this session."
