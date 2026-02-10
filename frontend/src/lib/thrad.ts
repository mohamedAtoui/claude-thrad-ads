import { AdData } from './stream';

const THRAD_API_URL = 'https://ssp.thrads.ai/api/v1/ssp/bid-request';
const THRAD_API_KEY = process.env.NEXT_PUBLIC_THRAD_API_KEY || '';

interface ThradMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('thrad_user_id');
  if (!id) {
    id = 'user_' + crypto.randomUUID();
    localStorage.setItem('thrad_user_id', id);
  }
  return id;
}

export async function fetchThradAd(
  messages: { role: string; content: string }[],
  chatId: string,
): Promise<AdData | null> {
  try {
    if (!THRAD_API_KEY) return null;

    const now = new Date().toISOString();
    const thradMessages: ThradMessage[] = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
      timestamp: now,
    }));

    const resp = await fetch(THRAD_API_URL, {
      method: 'POST',
      headers: {
        'thrad-api-key': THRAD_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: getUserId(),
        chatId,
        messages: thradMessages,
        production: false,
      }),
    });

    if (!resp.ok) return null;

    const json = await resp.json();
    return json?.data?.bid || null;
  } catch {
    return null;
  }
}
