import type { Database } from "@/lib/supabase/database.types";

/**
 * Roles used for RBAC across nav, guards, and UI rendering.
 *
 * Derived from the `app_role` enum in Postgres rather than hand-written, so a
 * new role added in a migration is a compile error here until it is handled.
 */
export type UserRole = Database["public"]["Enums"]["app_role"];

/**
 * The signed-in user as the app sees them: `auth.users` identity joined with
 * their `public.profiles` row.
 *
 * `role` is authoritative only because the database refuses to let a user
 * write it (see the column grants in migration 0002) — never because the
 * client said so.
 */
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
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

/** Discriminated result returned by every auth Server Action. */
export type AuthActionResult =
  | {
      ok: true;
      message?: string;
      /**
       * Set by `signInAction` so the client can land the user somewhere they
       * can actually go: admins to the dashboard, everyone else to the
       * storefront. Sending a member to `/dashboard` just bounces them.
       */
      isAdmin?: boolean;
    }
  | { ok: false; error: string };
