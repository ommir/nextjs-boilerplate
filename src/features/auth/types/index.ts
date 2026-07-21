/** Roles used for RBAC across nav, guards, and UI rendering. */
export type UserRole = "admin" | "member" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

/**
 * An authenticated session as seen by the client. The token itself lives in
 * an HttpOnly cookie set by the `/api/auth/*` route handlers and is never
 * exposed here.
 */
export interface AuthSession {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export type AuthStatus = "idle" | "authenticating" | "authenticated" | "error";
