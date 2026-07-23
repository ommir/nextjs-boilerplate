import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges the one-time code from a Supabase email link (confirmation or
 * password recovery) for a session, then forwards the user on.
 *
 * The `next` parameter is attacker-controllable — it arrives in a URL that can
 * be crafted and mailed to someone. It is therefore constrained to a relative
 * path on this origin; without that check this route is an open redirect,
 * which is exactly the kind of thing phishing campaigns look for.
 */
function safeRedirectPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Must start with a single "/" — rejects "//evil.com" and "https://evil.com".
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=invalid_link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
