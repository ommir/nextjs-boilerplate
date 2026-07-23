import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/config/env";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

/**
 * Edge middleware: refreshes the Supabase session on every request and gates
 * protected routes.
 *
 * - Unauthenticated hits on `/dashboard/*` -> `/login` (with `?from`).
 * - Authenticated hits on `/login` etc. -> `/dashboard`.
 *
 * This is a redirect for humans, not a security boundary. The real checks are
 * the server-side `getClaims()` in `dashboard/layout.tsx` and, underneath
 * everything, RLS in Postgres. Middleware runs before those and can be
 * bypassed by calling an action directly, so nothing may depend on it alone.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // In mock mode there is no Supabase to talk to; leave routing alone so the
  // boilerplate still runs with zero backend configuration.
  if (!isSupabaseConfigured) return NextResponse.next();

  const { supabaseResponse, claims } = await updateSession(request);
  const isAuthenticated = Boolean(claims?.sub);

  if (pathname.startsWith(PROTECTED_PREFIX) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    // Carry over the refreshed auth cookies, or the next request starts from
    // a stale token and the user bounces in a loop.
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
    supabaseResponse.cookies
      .getAll()
      .forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return supabaseResponse;
}

export const config = {
  // Everything except static assets. `/auth/*` is excluded too: the callback
  // route establishes the session itself and must not be redirected first.
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
