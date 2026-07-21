import { createHmac, timingSafeEqual } from "crypto";
import type { User } from "@/features/auth/types";

/**
 * Server-only signed session tokens. This is a boilerplate-grade stand-in for
 * a real session mechanism — swap for a vetted library (NextAuth, Lucia, Iron
 * Session) or an opaque id backed by a server-side session store before
 * shipping. The signature only proves the payload wasn't tampered with; it is
 * not encrypted, carries no expiry, and must never be imported from a
 * "use client" module (it relies on Node's `crypto` and a server secret).
 */

const SECRET = process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me";

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ONE_WEEK_SECONDS,
};

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function signaturesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/** Encode a user into a signed, opaque session token. */
export function encodeSessionToken(user: User): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** Decode and verify a session token, returning `null` if missing or tampered with. */
export function decodeSessionToken(token: string): User | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !signaturesMatch(sign(payload), signature)) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as User;
  } catch {
    return null;
  }
}
