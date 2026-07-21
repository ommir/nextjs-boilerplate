import type { AuthSession, LoginCredentials, RegisterInput } from "../types";

/**
 * Demo account surfaced on the login screen. In mock mode any non-empty
 * credentials are accepted; this pair is simply pre-filled for a one-click
 * sign-in.
 */
export const DEMO_CREDENTIALS: LoginCredentials = {
  email: "maxx.ledger@studio.app",
  password: "demo1234",
};

async function postAuth(path: string, body?: unknown): Promise<AuthSession> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as (AuthSession & { error?: string }) | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed");
  }
  return payload as AuthSession;
}

/**
 * Auth service. Talks to the same-origin `/api/auth/*` route handlers, which
 * set/clear an HttpOnly session cookie server-side — the client never sees
 * or stores the token itself.
 */
export const authService = {
  login(credentials: LoginCredentials): Promise<AuthSession> {
    return postAuth("/api/auth/login", credentials);
  },

  register(input: RegisterInput): Promise<AuthSession> {
    return postAuth("/api/auth/register", input);
  },

  async logout(): Promise<void> {
    await fetch("/api/auth/logout", { method: "POST" });
  },
};
