import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import type { Database } from "./database.types";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * Always create a new client per request — never hoist one into a module-level
 * singleton. On a fluid/serverless runtime a shared client would leak one
 * user's session into another user's request.
 *
 * This uses the *publishable* key and the caller's session cookies, so every
 * query runs as that user and is filtered by RLS. There is deliberately no
 * service-role client anywhere in this codebase.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Safe to ignore: the middleware refreshes the session cookies on
            // every request, so nothing is lost.
          }
        },
      },
    },
  );
}
