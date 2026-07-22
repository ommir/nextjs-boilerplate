"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Profile } from "../types";

/**
 * Makes the server-resolved profile available to client components.
 *
 * The profile is fetched in a Server Component (see `getCurrentProfile`) and
 * handed down as a prop. Nothing here fetches, caches, or persists a session:
 * the browser holds no copy of the auth state to go stale, and a tampered
 * client value buys nothing because every request is re-authorized on the
 * server and by RLS.
 */
const AuthContext = createContext<Profile | null>(null);

interface AuthProviderProps {
  profile: Profile | null;
  children: ReactNode;
}

export function AuthProvider({ profile, children }: AuthProviderProps) {
  return <AuthContext.Provider value={profile}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): Profile | null {
  return useContext(AuthContext);
}
