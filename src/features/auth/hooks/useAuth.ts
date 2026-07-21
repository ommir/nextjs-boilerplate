"use client";

import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";

/**
 * Ergonomic accessor over the auth store. Returns the current session, derived
 * flags, and the async actions.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  return {
    user,
    status,
    error,
    isAuthenticated: user !== null,
    isAuthenticating: status === "authenticating",
    /** Role predicate for RBAC checks in UI. */
    hasRole: (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    login,
    register,
    logout,
    clearError,
  };
}
