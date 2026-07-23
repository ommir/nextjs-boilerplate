"use client";

import { useAuthContext } from "../context/AuthProvider";
import type { UserRole } from "../types";

/**
 * Ergonomic accessor over the server-provided profile.
 *
 * `hasRole` drives what the UI *shows*. It is not what decides what a user can
 * *do* — that is `requireRole()` on the server and the RLS policies beneath
 * it. Hiding a button is a courtesy; the database is the control.
 */
export function useAuth() {
  const profile = useAuthContext();

  return {
    profile,
    isAuthenticated: profile !== null,
    hasRole: (...roles: UserRole[]) => (profile ? roles.includes(profile.role) : false),
  };
}
