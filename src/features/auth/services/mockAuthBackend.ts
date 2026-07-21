import type { LoginCredentials, RegisterInput, User } from "../types";

/**
 * Server-only stand-in for a real user database, backing the `/api/auth/*`
 * route handlers. Replace with actual credential verification and user
 * lookup against your persistence layer.
 */

const BASE_MOCK_USER: Omit<User, "email"> = {
  id: "usr_maxx",
  name: "Maxx Ledger",
  role: "admin",
  avatarUrl: null,
};

export function authenticateMock(credentials: LoginCredentials): User {
  if (!credentials.email || !credentials.password) {
    throw new Error("Email and password are required.");
  }
  return { ...BASE_MOCK_USER, email: credentials.email };
}

export function registerMock(input: RegisterInput): User {
  return {
    id: `usr_${Date.now()}`,
    name: input.name,
    email: input.email,
    role: "member",
    avatarUrl: null,
  };
}
