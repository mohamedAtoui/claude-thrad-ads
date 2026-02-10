export function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1] || '';
}

export function getAuthEmail(): string {
  if (typeof window === 'undefined') return '';
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_email='))
    ?.split('=')[1] || '';
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function clearAuth() {
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'auth_email=; path=/; max-age=0';
}

export function hasSeenOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  return document.cookie
    .split('; ')
    .some(row => row.startsWith('onboarding_seen='));
}

export function setOnboardingSeen(): void {
  document.cookie = 'onboarding_seen=1; path=/; max-age=31536000';
}
