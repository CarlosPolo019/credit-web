const key = "credit-web-session";

// localStorage (not sessionStorage): links that open in a new tab, like the
// "ver detalle completo" button in the credit-registered email, must see the
// same session as the tab the operator is already logged in on.
export function readSession() {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  localStorage.setItem(key, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(key);
}
