import requests
from django.conf import settings


def send_verification_code(to_email: str, code: str):
    """Send a 6-digit verification code via Brevo HTTP API."""
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 40px 20px;">
      <h2 style="color: #1A1714; margin-bottom: 8px;">Your verification code</h2>
      <p style="color: #6A6058; font-size: 14px; margin-bottom: 24px;">Enter this code to sign in to Claude:</p>
      <div style="background: #F5F0EB; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 32px; font-weight: 600; letter-spacing: 8px; color: #1A1714;">{code}</span>
      </div>
      <p style="color: #7A7067; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
    """

    resp = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "api-key": settings.BREVO_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "sender": {"email": settings.EMAIL_FROM_ADDRESS},
            "to": [{"email": to_email}],
            "subject": f"Your verification code is {code}",
            "htmlContent": html,
        },
        timeout=10,
    )
    resp.raise_for_status()
