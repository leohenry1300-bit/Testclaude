// Thin fetch wrapper for the Éloquence API with French, user-facing errors.

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

const TOKEN_KEY = "eloquence:token";

export function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable: session-only login */ }
}

export async function http<T>(method: string, url: string, body?: unknown, timeoutMs = 90_000): Promise<T> {
  const headers: Record<string, string> = { "X-Tz-Offset": String(new Date().getTimezoneOffset()) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: payload, signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    const timeout = (e as Error).name === "TimeoutError";
    throw new ApiError(0, timeout ? "timeout" : "network",
      timeout ? "Le serveur met trop de temps à répondre. Réessaie." : "Connexion impossible. Vérifie ton réseau puis réessaie.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? "error", data.message ?? "Une erreur est survenue. Réessaie.");
  }
  return data as T;
}

export interface ServerConfig {
  googleClientId: string | null;
  stt: "client" | "openai";
  llm: "heuristic" | "anthropic";
  mail: "console" | "resend";
}

/** Null when no API is reachable (static deployment): the app runs offline. */
export async function fetchServerConfig(): Promise<ServerConfig | null> {
  try {
    const res = await fetch("/api/config", { signal: AbortSignal.timeout(4000) });
    if (!res.ok || !res.headers.get("content-type")?.includes("json")) return null;
    return (await res.json()) as ServerConfig;
  } catch {
    return null;
  }
}
