import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/cookies";
import { encodeSessionToken, SESSION_COOKIE_OPTIONS } from "@/lib/session";
import { registerMock } from "@/features/auth/services/mockAuthBackend";
import type { RegisterInput } from "@/features/auth/types";

export async function POST(request: Request) {
  const input = (await request.json()) as RegisterInput;

  try {
    const user = registerMock(input);
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE, encodeSessionToken(user), SESSION_COOKIE_OPTIONS);
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
