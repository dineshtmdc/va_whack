# ==============================================================================
# This file is responsible for generating AI-powered summary reports.
# ==============================================================================
from openai import OpenAI
from ..core.config import settings
from typing import Dict, Any

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Uses OpenAI's GPT model to generate a user-friendly summary of the test results.
def generate_ai_summary(player_name: str, analysis_results: Dict[str, Any]) -> str:

    if not settings.OPENAI_API_KEY:
        return "AI reporting is not configured."

    # Create a detailed prompt for the AI
    prompt = f"""
    Generate a brief, easy-to-understand summary for a vision test report for a player named {player_name}.
    The tone should be encouraging and informative, not a clinical diagnosis. Always mention the final calculated logMAR score if it exists.
    Here are the technical results:
    - Final Calculated Visual Acuity (logMAR): {analysis_results.get('finalVA') or 'N/A'} (lower is better, 0.0 is like 20/20 vision)
    - Best Visual Acuity (logMAR): {analysis_results.get('bestVA') or 'N/A'}
    - Total Trials: {analysis_results.get('totalTrials') or analysis_results.get('n') or 'N/A'}
    - Accuracy: {analysis_results.get('accuracy', 'N/A')}%
    - False Positive Rate: {analysis_results.get('falsePositiveRate', 'N/A')}%
    - Miss Rate: {analysis_results.get('missRate', 'N/A')}%

    Based on this, write a short, positive paragraph. For example, mention their great focus if accuracy is high, 
    or their sharp eyes if the logMAR score is good.
    """

    try:
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant who summarizes vision game results in a friendly, encouraging, and clear way."},
                {"role": "user", "content": prompt}
            ],
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating AI summary: {e}")
        return "Could not generate an AI summary for this session."