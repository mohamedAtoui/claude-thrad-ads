import requests
from datetime import datetime, timezone
from django.conf import settings


def get_thrad_ad(messages: list, user_id: str, chat_id: str) -> dict | None:
    """
    Call the Thrad SSP API to get a real-time ad bid.

    Args:
        messages: List of dicts with 'role' and 'content' keys (must have ≥2,
                  alternating user/assistant, ending with assistant).
        user_id: Anonymous user identifier (UUID or hash).
        chat_id: The chat/session identifier.

    Returns:
        The bid dict (advertiser, headline, description, cta_text, url, image_url)
        on success, or None on error / no bid.
    """
    try:
        # Build Thrad-format messages with timestamps
        now = datetime.now(timezone.utc).isoformat()
        thrad_messages = [
            {
                'role': m['role'],
                'content': m['content'],
                'timestamp': now,
            }
            for m in messages
        ]

        payload = {
            'userId': user_id,
            'chatId': chat_id,
            'messages': thrad_messages,
            'production': False,  # Sandbox mode — always returns ads
        }

        headers = {
            'thrad-api-key': settings.THRAD_API_KEY,
            'Content-Type': 'application/json',
        }
        if settings.THRAD_CHATBOT_URL:
            headers['Origin'] = settings.THRAD_CHATBOT_URL

        resp = requests.post(
            'https://ssp.thrads.ai/api/v1/ssp/bid-request',
            headers=headers,
            json=payload,
            timeout=6,
        )
        resp.raise_for_status()

        data = resp.json().get('data', {})
        bid = data.get('bid')
        if not bid:
            return None

        return bid

    except Exception:
        # Ad failure must never break the chat
        return None
