import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import { isMockMode } from "@/config/env";
import type { Profile, UserRole } from "@/features/auth/types";

/**
 * Server-side auth guards.
 *
 * Server Actions are ordinary public HTTP endpoints — a hidden button is not
 * authorization. Every action and every protected page starts by calling one
 * of these. They are the app-level check; RLS in Postgres is the one that
 * actually holds if this is ever forgotten.
 */

/**
 * Stand-in identity for mock mode, so the dashboard is explorable with no
 * backend. `config/env.ts` makes mock mode impossible in a production build,
 * which is what keeps this from being an authentication bypass.
 */
const MOCK_PROFILE: Profile = {
  id: "00000000-0000-4000-8000-000000000000",
  name: "Mock Admin",
  email: "mock-admin@studio.local",
  role: "admin",
  avatarUrl: null,
};

/** The verified auth user, or `null`. Never trusts the cookie payload itself. */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  if (isMockMode) return { id: MOCK_PROFILE.id, email: MOCK_PROFILE.email };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
}

/** The signed-in user's profile (including role), or `null` when signed out. */
export async function getCurrentProfile(): Promise<Profile | null> {
  if (isMockMode) return MOCK_PROFILE;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  // RLS restricts this to the caller's own row, so the `eq` is about fetching
  // a single row rather than about correctness.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: typeof data?.claims?.email === "string" ? data.claims.email : "",
    role: profile.role,
    avatarUrl: profile.avatar_url,
  };
}

/** Redirects to the login page when signed out. */
export async function requireUser(): Promise<{ id: string; email: string }> {
  const user = await getCurrentUser();
  if (!user) redirect(siteConfig.loginUrl);
  return user;
}

/**
 * Requires one of `roles`. Signed-out users go to login; signed-in users
 * without the role go to the storefront.
 *
 * That destination matters: sending them to `siteConfig.homeUrl` (which is
 * `/dashboard`) produced an infinite redirect, because every dashboard route
 * requires admin — the bounce target bounced them straight back. The fallback
 * has to be somewhere the least-privileged user can actually land.
 */
export async function requireRole(...roles: UserRole[]): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(siteConfig.loginUrl);
  if (!roles.includes(profile.role)) redirect(siteConfig.storefrontUrl);
  return profile;
}

/** Shorthand for the common admin-only case. */
export function requireAdmin(): Promise<Profile> {
  return requireRole("admin");
}
