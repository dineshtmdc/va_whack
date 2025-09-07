# ==============================================================================
# This file contains services that interact with external APIs.
# It now sends emails via Gmail SMTP only.
# va_whack.api\app\services\email_service.py
# ==============================================================================

import datetime
import smtplib
from email.mime.text import MIMEText
from typing import Optional, List

from app.models.models import EngagementGame, VAScaleGame
from ..core.config import settings


def _send_via_gmail_smtp(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using Gmail's free SMTP servers.
    Requires:
      - settings.GMAIL_SMTP_USER = your Gmail address
      - settings.GMAIL_SMTP_APP_PASSWORD = 16-char app password
    """
    try:
        msg = MIMEText(html_content, "html")
        msg["Subject"] = subject
        msg["From"] = settings.GMAIL_SMTP_USER
        msg["To"] = to_email

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(settings.GMAIL_SMTP_USER, settings.GMAIL_SMTP_APP_PASSWORD)
            server.sendmail(settings.GMAIL_SMTP_USER, [to_email], msg.as_string())
        return True
    except Exception as e:
        print(f"Gmail SMTP failed: {e}")
        return False


def send_email(to_email: str, subject: str, html_content: str, player_name: Optional[str] = "User") -> bool:
    """Main send function – always uses Gmail SMTP now."""
    return _send_via_gmail_smtp(to_email, subject, html_content)


def build_common_email_template(player_name: str, content_html: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{
      font-family: Arial, sans-serif;
      background-color: #f4f7fa;
      color: #333;
      margin: 0;
      padding: 0;
    }}
    .container {{
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }}
    .header {{
      background-color: #1d4ed8;
      color: white;
      padding: 20px;
      text-align: center;
    }}
    .header h1 {{
      margin: 0;
      font-size: 24px;
    }}
    .content {{
      padding: 25px;
    }}
    .footer {{
      background-color: #f0f0f0;
      padding: 15px;
      font-size: 12px;
      text-align: center;
      color: #666;
    }}
    h3 {{
      color: #1d4ed8;
    }}
    ul {{
      padding-left: 20px;
    }}
    ul li {{
      margin-bottom: 4px;
    }}
    .summary-box {{
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 5px;
      margin-top: 10px;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>👁️ Vision Testing App</h1>
    </div>
    <div class="content">
      <p>Hello <strong>{player_name}</strong>,</p>
      <p>Here is your personalized summary from your recent vision test session:</p>

      {content_html}

      <p style="margin-top: 20px;">👓 Stay sharp and take care of your eyes!</p>
    </div>
    <div class="footer">
      &copy; {datetime.datetime.now().year} Vision Testing App. All rights reserved.<br>
      This is an automated message. Please do not reply.
    </div>
  </div>
</body>
</html>
"""


# Sends a verification PIN email
def send_verification_pin(recipient_email: str, pin: str):
    pin_html = f"""
        <h3>🔐 Verification Code</h3>
        <p>Thank you for registering for the Vision Testing App.</p>
        <p>Your verification PIN is:</p>
        <h2><strong>{pin}</strong></h2>
        <p>This PIN will expire in <strong>{settings.PIN_EXPIRATION_MINUTES} minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
    """
    html_content = build_common_email_template("User", pin_html)
    return send_email(recipient_email, "Vision Testing App Verification Code", html_content)


# Sends the AI-generated summary report to the player
def send_summary_report(
    recipient_email: str,
    player_name: str,
    report: str,
    scale_game: VAScaleGame,
    engagement_games: List[EngagementGame]
):
    formatted_report = report.replace('\n', '<br>')

    # Extract scale game score
    scale_score = scale_game.score if scale_game and scale_game.score else None
    scale_game_html = f"""
        <h3>🔍 Visual Acuity Scale Game</h3>
        <ul>
            <li><strong>Final logMAR:</strong> {scale_score.final_va if scale_score else 'N/A'}</li>
            <li><strong>Best logMAR:</strong> {scale_score.best_va if scale_score else 'N/A'}</li>
            <li><strong>Scale Steps Taken:</strong> {scale_score.n if scale_score else 'N/A'}</li>
        </ul>
    """

    # Add all 5 Engagement Game levels
    difficulty_levels = ["Very Easy", "Easy", "Medium", "Hard", "Very Hard"]
    engagement_blocks = []
    for i, game in enumerate(engagement_games[:5]):
        score = game.score
        level = difficulty_levels[i] if i < len(difficulty_levels) else f"Level {i+1}"
        if not score:
            continue
        engagement_blocks.append(f"""
            <h4>{level}</h4>
            <ul>
                <li>Detection Speed (SS₁): {score.detection_speed}</li>
                <li>Detection Accuracy (SS₂): {score.detection_accuracy}</li>
                <li>Spatial Uniformity (SS₃): {score.spatial_uniformity}</li>
                <li>Sensitivity Threshold (SS₄): {score.sensitivity_threshold}</li>
                <li>False Positive Rate (SS₅): {score.false_positive_rate}</li>
                <li>Miss Rate (SS₆): {score.miss_rate}</li>
                <li>Click Validity (SS₇): {score.click_validity}</li>
                <li>Trial Consistency (SS₈): {score.trial_consistency}</li>
                <li>Max Hit Streak (SS₉): {score.max_hit_streak}</li>
                <li>Coordination Proxy (SS₁₀): {score.coordination_proxy}</li>
                <li>Target Discrimination (SS₁₁): {score.target_discrimination}</li>
                <li>VA Final (logMAR): {score.va_final}</li>
            </ul>
        """)

    engagement_html = f"""
        <h3>🎯 Engagement Game Results</h3>
        {''.join(engagement_blocks)}
    """

    combined_content = f"""
        {scale_game_html}
        {engagement_html}
        <h3>📝 AI Summary</h3>
        <div class="summary-box">{formatted_report}</div>
    """

    html_content = build_common_email_template(player_name, combined_content)
    return send_email(recipient_email, "Your Vision Test Report and Summary", html_content, player_name)
