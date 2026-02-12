import hashlib
import logging
import random

import requests
from datetime import datetime, timezone
from django.conf import settings

logger = logging.getLogger(__name__)

MOCK_ADS = [
    {
        'advertiser': 'Nike',
        'headline': 'Just Do It - New Collection',
        'description': 'Discover the latest Nike running shoes designed for every level. Free shipping on orders over $50.',
        'cta_text': 'Shop Now',
        'url': 'https://www.nike.com',
    },
    {
        'advertiser': 'Notion',
        'headline': 'Your All-in-One Workspace',
        'description': "Write, plan, and organize in one place. Trusted by teams at the world's best companies.",
        'cta_text': 'Try Free',
        'url': 'https://www.notion.so',
    },
    {
        'advertiser': 'Vercel',
        'headline': 'Deploy Instantly',
        'description': 'The platform for frontend developers. Build and deploy your next project in seconds.',
        'cta_text': 'Start Building',
        'url': 'https://vercel.com',
    },
    {
        'advertiser': 'Linear',
        'headline': 'Issue Tracking, Streamlined',
        'description': 'The tool for modern software teams. Plan, track, and ship world-class products.',
        'cta_text': 'Get Started',
        'url': 'https://linear.app',
    },
]


def _call_thrad_api(api_key: str, payload: dict) -> dict | None:
    """Make a single Thrad SSP bid request with the given API key.

    Returns the bid dict on success, or None on failure.
    """
    headers = {
        'thrad-api-key': api_key,
        'Content-Type': 'application/json',
    }
    # No Origin header — server-to-server call avoids the 403
    resp = requests.post(
        'https://ssp.thrads.ai/api/v1/ssp/bid-request',
        headers=headers,
        json=payload,
        timeout=10,
    )
    logger.info('Thrad API [key=…%s] status=%s body=%s', api_key[-6:], resp.status_code, resp.text[:500])
    resp.raise_for_status()

    data = resp.json().get('data', {})
    return data.get('bid')


def get_thrad_ad(messages: list, user_id: str, chat_id: str, turn_number: int = 0) -> dict | None:
    """
    Call the Thrad SSP API to get a real-time ad bid (server-to-server).

    Tries the primary API key first, then the fallback key.
    If both fail, returns a random mock ad so the UI never breaks.
    """
    # Thrad requires minimum 2 messages (user + assistant, alternating)
    if len(messages) < 2:
        logger.info('Skipping Thrad API: only %d message(s)', len(messages))
        return random.choice(MOCK_ADS)

    # Anonymize user_id — Thrad docs say "never use PII"
    anon_id = 'user_' + hashlib.sha256(user_id.encode()).hexdigest()[:16]

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
        'userId': anon_id,
        'chatId': chat_id,
        'messages': thrad_messages,
        'production': False,
        'turn_number': turn_number,
        'adtype': '',
    }

    # Try primary key, then fallback key
    print(f'[THRAD DEBUG] message_count={len(messages)} turn={turn_number} chat={chat_id}')
    print(f'[THRAD DEBUG] primary_key_set={bool(settings.THRAD_API_KEY)} fallback_key_set={bool(settings.THRAD_API_KEY_FALLBACK)}')
    for key in [settings.THRAD_API_KEY, settings.THRAD_API_KEY_FALLBACK]:
        if not key:
            print('[THRAD DEBUG] key is empty, skipping')
            continue
        try:
            print(f'[THRAD DEBUG] calling Thrad API with key …{key[-6:]}')
            bid = _call_thrad_api(key, payload)
            if bid:
                print(f'[THRAD DEBUG] got bid: {bid}')
                return bid
            print(f'[THRAD DEBUG] no bid returned for key …{key[-6:]}')
        except Exception as e:
            print(f'[THRAD DEBUG] exception for key …{key[-6:]}: {type(e).__name__}: {e}')

    # Both keys failed or returned no bid — return mock ad
    print('[THRAD DEBUG] all keys failed, returning mock ad')
    return random.choice(MOCK_ADS)
