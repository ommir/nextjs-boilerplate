import { NextResponse, type NextRequest } from "next/server";

/** Must match `AUTH_COOKIE` in `src/lib/cookies.ts`. */
const AUTH_COOKIE = "studio-auth";
const PROTECTED_PREFIX = "/dashboard";
const AUTH_ROUTES = ["/login", "/register"];

/**
 * Edge middleware gating protected routes.
 * - Unauthenticated hits on `/dashboard/*` -> redirect to `/login` (with `?from`).
 * - Authenticated hits on `/login` or `/register` -> redirect to `/dashboard`.
 *
 * This is the first line of defense; `dashboard/layout.tsx` backs it up with a
 * server-side check of the same cookie.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (pathname.startsWith(PROTECTED_PREFIX) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_ROUTES.includes(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and API routes.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
