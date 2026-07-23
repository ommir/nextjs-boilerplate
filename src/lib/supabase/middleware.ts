import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";

/**
 * Refreshes the Supabase auth token and returns the response carrying the
 * updated cookies, along with the verified claims.
 *
 * Two rules here are load-bearing and easy to break by accident:
 *
 *  1. Nothing may run between `createServerClient` and `getClaims()`. Inserting
 *     work there is the classic cause of users being randomly signed out.
 *  2. The returned `supabaseResponse` must be passed through intact. If a
 *     caller builds its own response it has to copy the cookies over, or the
 *     refreshed token never reaches the browser.
 *
 * `getClaims()` — not `getSession()` — is what makes this a real check: it
 * verifies the JWT signature against the project's published keys. Session
 * cookies are attacker-controllable; a verified signature is not.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();

  return { supabaseResponse, claims: data?.claims ?? null };
}
