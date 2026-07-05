const SESSION_KEY = "traveler-front-session-id";

export function getOrCreateSessionId() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, next);
  return next;
}
