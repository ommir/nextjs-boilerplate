import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/cookies";
import { decodeSessionToken } from "@/lib/session";

/** Lets a client re-verify/rehydrate the current session on demand. */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const user = token ? decodeSessionToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
