from datetime import datetime, timezone
from .storage import _email_hash, _redis_get, _redis_set

INTEREST_KEYWORDS = {
    'technology': ['code', 'coding', 'programming', 'software', 'app', 'computer', 'tech', 'developer', 'api', 'python', 'javascript', 'react', 'ai', 'machine learning', 'data', 'algorithm', 'web', 'database', 'cloud', 'server'],
    'fashion': ['shoes', 'clothing', 'fashion', 'style', 'outfit', 'wear', 'dress', 'sneakers', 'brand', 'designer', 'apparel', 'accessories', 'wardrobe', 'trend'],
    'finance': ['money', 'invest', 'investing', 'stock', 'stocks', 'crypto', 'bitcoin', 'bank', 'finance', 'financial', 'budget', 'savings', 'trading', 'portfolio', 'wealth', 'income'],
    'health': ['health', 'fitness', 'workout', 'exercise', 'diet', 'nutrition', 'wellness', 'medical', 'gym', 'yoga', 'running', 'sleep', 'mental health', 'vitamins'],
    'food': ['food', 'recipe', 'cooking', 'restaurant', 'meal', 'dinner', 'lunch', 'breakfast', 'cuisine', 'chef', 'baking', 'kitchen', 'ingredients'],
    'travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'destination', 'tourism', 'explore', 'adventure', 'booking', 'airport', 'cruise'],
    'entertainment': ['movie', 'music', 'game', 'gaming', 'show', 'series', 'netflix', 'spotify', 'concert', 'stream', 'podcast', 'book', 'read'],
    'education': ['learn', 'study', 'course', 'tutorial', 'school', 'university', 'degree', 'certification', 'class', 'teach', 'education', 'training'],
}


def get_profile(email: str) -> dict:
    eh = _email_hash(email)
    profile = _redis_get(f'profiles:{eh}')
    if profile:
        return profile
    return {
        'email': email.lower().strip(),
        'interests': {},
        'recent_topics': [],
        'total_messages': 0,
        'last_active': datetime.now(timezone.utc).isoformat(),
    }


def update_interests(email: str, message: str):
    profile = get_profile(email)
    message_lower = message.lower()

    matched_topics = []
    for category, keywords in INTEREST_KEYWORDS.items():
        for keyword in keywords:
            if keyword in message_lower:
                current = profile['interests'].get(category, 0)
                profile['interests'][category] = current + 1
                if keyword not in profile['recent_topics']:
                    matched_topics.append(keyword)
                break

    # Keep recent_topics to last 20
    profile['recent_topics'] = (matched_topics + profile['recent_topics'])[:20]
    profile['total_messages'] = profile.get('total_messages', 0) + 1
    profile['last_active'] = datetime.now(timezone.utc).isoformat()

    eh = _email_hash(email)
    _redis_set(f'profiles:{eh}', profile)
    return profile
