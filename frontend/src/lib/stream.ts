import { API_URL, getToken } from './api';

export interface AdData {
  advertiser: string;
  headline: string;
  description: string;
  cta_text: string;
  url: string;
  image_url?: string;
}

export async function streamChat(
  chatId: string,
  message: string,
  onChunk: (text: string) => void,
  onDone: (messageId: string) => void,
  onError: (error: string) => void,
  signal?: AbortSignal,
) {
  const token = getToken();

  try {
    const res = await fetch(`${API_URL}/api/chats/${chatId}/send/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify({ message }),
      signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      onError(data.error || `API error ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('No response body');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const data = JSON.parse(jsonStr);
          if (data.error) {
            onError(data.error);
            return;
          }
          if (data.done) {
            onDone(data.message_id || '');
            return;
          }
          if (data.chunk) {
            onChunk(data.chunk);
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Stream failed');
  }
}
