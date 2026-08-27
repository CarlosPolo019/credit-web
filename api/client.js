import { readSession } from "../auth/auth.storage.js";

let tokenProvider = () => readSession()?.token ?? null;

export function setTokenProvider(provider) {
  tokenProvider = provider;
}

export async function login(username, password) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}

export async function request(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
  const headers = { "Content-Type": "application/json", ...(options.headers ?? {}) };
  const token = tokenProvider();
  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (response.status === 401) {
    window.dispatchEvent(new Event("credit-auth-expired"));
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : null;
  if (!response.ok) {
    const message = payload?.message ?? "No se pudo completar la solicitud.";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

/**
 * Like `request`, but for binary responses (e.g. the PDF export) — returns
 * the raw Blob instead of trying to parse JSON.
 */
export async function requestBlob(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
  const token = tokenProvider();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${baseUrl}${path}`, { headers });

  if (response.status === 401) {
    window.dispatchEvent(new Event("credit-auth-expired"));
  }
  if (!response.ok) {
    throw new Error("No se pudo completar la solicitud.");
  }
  return response.blob();
}
