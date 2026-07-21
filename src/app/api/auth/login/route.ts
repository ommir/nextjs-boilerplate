import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/cookies";
import { encodeSessionToken, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { authenticateMock } from "@/features/auth/services/mockAuthBackend";
import type { LoginCredentials } from "@/features/auth/types";

/** Sets an HttpOnly session cookie on success — the token never reaches client JS. */
export async function POST(request: Request) {
  const credentials = (await request.json()) as LoginCredentials;

  try {
    const user = authenticateMock(credentials);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, encodeSessionToken(user), SESSION_COOKIE_OPTIONS);
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
