const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1] || '';
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error ${res.status}`);
  }
  return res.json();
}

export async function sendCode(email: string) {
  return apiFetch('/auth/send-code/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyCode(email: string, code: string) {
  const data = await apiFetch('/auth/verify-code/', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
  // Set cookies
  document.cookie = `auth_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 30}`;
  document.cookie = `auth_email=${data.email}; path=/; max-age=${60 * 60 * 24 * 30}`;
  return data;
}

export async function listChats() {
  const data = await apiFetch('/chats/');
  return data.chats;
}

export async function createChat(message: string) {
  const data = await apiFetch('/chats/', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  return data.chat;
}

export async function getChat(chatId: string) {
  const data = await apiFetch(`/chats/${chatId}/`);
  return data.chat;
}

export async function sendFeedback(chatId: string, messageId: string, feedback: 'like' | 'dislike') {
  return apiFetch(`/chats/${chatId}/feedback/`, {
    method: 'POST',
    body: JSON.stringify({ message_id: messageId, feedback }),
  });
}

export { API_URL, getToken };
