# ==============================================================================
# This file contains services that interact with external APIs.
# It abstracts the logic for sending emails via SendGrid.
# ==============================================================================

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from ..core.config import settings

def send_verification_pin(recipient_email: str, pin: str):
    message = Mail(
        from_email=settings.SENDER_EMAIL,
        to_emails=recipient_email,
        subject='Vision Testing App Verification Code',
        html_content=f"""
        <p>Hello,</p>
        <p>Thank you for registering for Vision Testing App. Your verification PIN is:</p>
        <h2><strong>{pin}</strong></h2>
        <p>This PIN will expire in {settings.PIN_EXPIRATION_MINUTES} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        """
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Email sent to {recipient_email}, status code: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
    
# Sends the AI-generated summary report to the player.
def send_summary_report(recipient_email: str, player_name: str, report: str): 
    
    formatted_report = report.replace('\n', '<br>')   
    message = Mail(
        from_email=settings.SENDER_EMAIL,
        to_emails=recipient_email,
        subject='Your Vision Test Summary',
        html_content=f"""
        <p>Hello {player_name},</p>
        <p>Here is a summary of your recent vision test session:</p>
        <div style="background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
            {formatted_report}
        </div>
        <p>Thank you for using the Vision Testing App!</p>
        """
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"Summary report sent to {recipient_email}, status code: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error sending summary report: {e}")
        return False
