import json
import random
import uuid
import hashlib
from datetime import datetime, timezone
from django.conf import settings
from upstash_redis import Redis


def _get_redis():
    """Get Redis client connected to Vercel KV (Upstash)."""
    return Redis(
        url=settings.KV_REST_API_URL,
        token=settings.KV_REST_API_TOKEN,
    )


def _email_hash(email: str) -> str:
    return hashlib.sha256(email.lower().strip().encode()).hexdigest()[:16]


def _redis_get(key: str) -> dict | None:
    r = _get_redis()
    data = r.get(key)
    if data is None:
        return None
    if isinstance(data, str):
        return json.loads(data)
    return data


def _redis_set(key: str, data: dict):
    r = _get_redis()
    r.set(key, json.dumps(data, default=str))


# ── Verification code operations ──

VERIFY_TTL = 600  # 10 minutes
MAX_ATTEMPTS = 5


def create_verification_code(email: str) -> str:
    """Generate a 6-digit code, store in Redis with 10-min TTL."""
    code = f'{random.randint(0, 999999):06d}'
    eh = _email_hash(email)
    r = _get_redis()
    r.set(f'verify:{eh}', json.dumps({'code': code, 'attempts': 0}), ex=VERIFY_TTL)
    return code


def verify_code(email: str, code: str) -> bool:
    """Check code, delete on success, track failed attempts (max 5)."""
    eh = _email_hash(email)
    r = _get_redis()
    key = f'verify:{eh}'
    data = r.get(key)
    if data is None:
        return False
    if isinstance(data, str):
        data = json.loads(data)

    if data.get('attempts', 0) >= MAX_ATTEMPTS:
        r.delete(key)
        return False

    if data['code'] == code.strip():
        r.delete(key)
        return True

    # Wrong code — increment attempts
    data['attempts'] = data.get('attempts', 0) + 1
    ttl = r.ttl(key)
    if ttl and ttl > 0:
        r.set(key, json.dumps(data), ex=ttl)
    else:
        r.delete(key)
    return False


def delete_verification_code(email: str):
    """Clean up verification code (e.g. on email send failure)."""
    eh = _email_hash(email)
    r = _get_redis()
    r.delete(f'verify:{eh}')


# ── User operations ──

def get_user(email: str) -> dict | None:
    return _redis_get(f'users:{_email_hash(email)}')


def create_user(email: str) -> dict:
    token = uuid.uuid4().hex
    eh = _email_hash(email)
    user = {
        'email': email.lower().strip(),
        'created_at': datetime.now(timezone.utc).isoformat(),
        'token': token,
    }
    r = _get_redis()
    r.set(f'users:{eh}', json.dumps(user, default=str))
    # Secondary index: token → email hash for fast lookup
    r.set(f'tokens:{token}', eh)
    return user


def get_user_by_token(token: str) -> dict | None:
    r = _get_redis()
    eh = r.get(f'tokens:{token}')
    if not eh:
        return None
    return _redis_get(f'users:{eh}')


# ── Chat operations ──

def get_chat(chat_id: str) -> dict | None:
    return _redis_get(f'chats:{chat_id}')


def create_chat(user_email: str, first_message: str) -> dict:
    chat_id = uuid.uuid4().hex[:12]
    title = first_message[:50].strip()
    if len(first_message) > 50:
        title += '...'
    eh = _email_hash(user_email)
    chat = {
        'id': chat_id,
        'user_email': user_email.lower().strip(),
        'title': title,
        'created_at': datetime.now(timezone.utc).isoformat(),
        'messages': [],
    }
    r = _get_redis()
    r.set(f'chats:{chat_id}', json.dumps(chat, default=str))
    # Track chat IDs per user
    r.sadd(f'user_chats:{eh}', chat_id)
    return chat


def update_chat(chat_id: str, messages: list):
    chat = _redis_get(f'chats:{chat_id}')
    if not chat:
        return
    chat['messages'] = messages
    _redis_set(f'chats:{chat_id}', chat)


def add_message(chat_id: str, role: str, content: str) -> dict:
    chat = _redis_get(f'chats:{chat_id}')
    if not chat:
        return {}
    message = {
        'id': uuid.uuid4().hex[:8],
        'role': role,
        'content': content,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'feedback': None,
    }
    chat['messages'].append(message)
    _redis_set(f'chats:{chat_id}', chat)
    return message


def update_message_feedback(chat_id: str, message_id: str, feedback: str):
    chat = _redis_get(f'chats:{chat_id}')
    if not chat:
        return
    for msg in chat['messages']:
        if msg.get('id') == message_id:
            msg['feedback'] = feedback
            break
    _redis_set(f'chats:{chat_id}', chat)


def list_user_chats(email: str) -> list:
    eh = _email_hash(email)
    r = _get_redis()
    chat_ids = r.smembers(f'user_chats:{eh}')
    if not chat_ids:
        return []
    result = []
    for chat_id in chat_ids:
        chat = _redis_get(f'chats:{chat_id}')
        if chat:
            result.append({
                'id': chat['id'],
                'title': chat['title'],
                'created_at': chat['created_at'],
                'message_count': len(chat.get('messages', [])),
            })
    # Sort by created_at descending
    result.sort(key=lambda c: c['created_at'], reverse=True)
    return result
