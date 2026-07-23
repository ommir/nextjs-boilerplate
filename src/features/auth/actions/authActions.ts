"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";
import { isMockMode } from "@/config/env";
import type { AuthActionResult } from "../types";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/authSchemas";

/**
 * Auth Server Actions.
 *
 * Everything that mutates a session lives here so the browser never holds a
 * Supabase client capable of it. Each action validates its input server-side
 * before touching Supabase — the client-side validation is a UX affordance,
 * not a control.
 */

function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Check the form and try again.";
}

/**
 * Mock mode has no auth server to talk to, and `createServerClient` throws on
 * an empty URL. Validation still runs first in every action below, so the
 * forms behave identically — they just cannot establish a real session.
 */
const MOCK_MODE_RESULT: AuthActionResult = {
  ok: true,
  message: "Mock mode: no Supabase project is configured, so no email was sent.",
};

/**
 * Where Supabase should send the user back to after they click an email link.
 * Derived from the request's own host rather than a configured base URL so it
 * is correct in dev, preview, and production without extra env vars.
 */
async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  // The mock user is an admin (see getCurrentProfile), so mock-mode sign-in
  // lands on the dashboard like a real admin would.
  if (isMockMode) return { ok: true, isAdmin: true };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    // Deliberately generic: distinguishing "no such user" from "wrong
    // password" hands an attacker a free account-enumeration oracle.
    return { ok: false, error: "Those credentials didn't work. Try again." };
  }

  // Decide the landing page by role. The session is live on `supabase` now, so
  // this reads the caller's own profile under RLS. `role` is authoritative
  // because the database refuses to let a user write it, not because we trust
  // the client.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  revalidatePath("/", "layout");
  return { ok: true, isAdmin: profile?.role === "admin" };
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  if (isMockMode) return MOCK_MODE_RESULT;

  const { name, email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Read by the handle_new_user() trigger to populate profiles.name.
      data: { name },
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Same message whether or not the address was already registered — again,
  // no enumeration oracle.
  return {
    ok: true,
    message: "Check your email for a confirmation link to finish signing up.",
  };
}

export async function signOutAction(): Promise<void> {
  if (isMockMode) redirect(siteConfig.loginUrl);

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(siteConfig.loginUrl);
}

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  if (isMockMode) return MOCK_MODE_RESULT;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await getOrigin()}/auth/callback?next=/reset-password`,
  });

  // Unconditional success: revealing whether the address exists would leak
  // the user list one guess at a time.
  return {
    ok: true,
    message: "If that address has an account, a reset link is on its way.",
  };
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  if (isMockMode) return MOCK_MODE_RESULT;

  const supabase = await createClient();

  // Only reachable with the short-lived recovery session Supabase established
  // via the callback route; without it there is no user to update.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) {
    return { ok: false, error: "This reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true, message: "Password updated." };
}
