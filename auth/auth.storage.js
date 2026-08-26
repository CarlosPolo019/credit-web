const key = "credit-web-session";

export function readSession() {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  sessionStorage.setItem(key, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(key);
}
