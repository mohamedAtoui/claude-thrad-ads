import { AdData } from './stream';
import { API_URL, getToken } from './api';

export async function fetchThradAd(
  messages: { role: string; content: string }[],
  chatId: string,
): Promise<AdData | null> {
  try {
    const turnNumber = messages.filter((m) => m.role === 'assistant').length;
    const token = getToken();
    const res = await fetch(`${API_URL}/api/chats/${chatId}/ads/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ turn_number: turnNumber }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ad || null;
  } catch {
    return null;
  }
}
