"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env";
import type { Database } from "./database.types";

/**
 * Supabase client for the browser.
 *
 * Scope note: this exists for *session-aware UI* only — reacting to
 * `onAuthStateChange` and signing out. Every read and write in this app goes
 * through a Server Component or a Server Action instead, so that
 * authorization is decided on the server and enforced by RLS rather than
 * being spread across client code.
 *
 * `createBrowserClient` is internally memoised, so calling this repeatedly
 * returns the same instance.
 */
export function createClient() {
  return createBrowserClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
  );
}
