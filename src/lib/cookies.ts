/**
 * Cookie name shared by the middleware, the `/api/auth/*` route handlers, and
 * `src/lib/session.ts`. The cookie itself is HttpOnly and set/cleared
 * server-side only — client JS never reads or writes it — so this constant
 * exists purely to keep the name in sync across those modules.
 */
export const AUTH_COOKIE = "studio-auth";
