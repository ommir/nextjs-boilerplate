import { z } from "zod";

/**
 * Centralised, validated access to environment variables.
 *
 * Reading env vars through this module (instead of `process.env` scattered
 * everywhere) gives us one boundary to validate at and a single place to reason
 * about what is public vs. server-only.
 *
 * Next.js inlines `process.env.NEXT_PUBLIC_*` at build time only when it sees
 * the full literal member expression, so each one is written out longhand
 * below rather than looked up dynamically.
 */

const envSchema = z.object({
  /** Supabase project URL. Blank/absent puts the app in mock mode. */
  NEXT_PUBLIC_SUPABASE_URL: z
    .union([z.url({ protocol: /^https?$/ }), z.literal("")])
    .default(""),
  /**
   * Publishable (formerly "anon") key. Public by design — RLS is what protects
   * the data. Rejected if it looks like a secret key, which is the one paste
   * mistake that would be catastrophic here.
   */
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .refine((value) => !value.startsWith("sb_secret_"), {
      message:
        "This is a SECRET key. It bypasses RLS and must never be exposed to the browser. Use the publishable key (sb_publishable_...).",
    })
    .default(""),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Studio"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!parsed.success) {
  // Fail loudly and early. A half-configured backend is far worse to debug
  // than a refusal to boot.
  throw new Error(
    `Invalid environment configuration:\n${z.prettifyError(parsed.error)}`,
  );
}

const parsedEnv = parsed.data;

export const env = {
  supabaseUrl: parsedEnv.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: parsedEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  /** Public application name. */
  appName: parsedEnv.NEXT_PUBLIC_APP_NAME,
  /** True in `next dev`. */
  isDev: process.env.NODE_ENV === "development",
} as const;

/**
 * Whether a real Supabase backend is wired up.
 *
 * Both halves are required: a URL without a key (or the reverse) is a
 * misconfiguration, and silently half-connecting would produce confusing
 * 401s at runtime instead of an obvious "you're in mock mode".
 */
export const isSupabaseConfigured =
  env.supabaseUrl !== "" && env.supabasePublishableKey !== "";

/**
 * Mock mode: when Supabase is not configured, every repository falls back to
 * in-memory data and the app treats you as a signed-in admin, so the
 * boilerplate is explorable with zero backend setup.
 *
 * SECURITY: that fallback is a development affordance and would be an
 * authentication bypass in production — a deploy with a typo'd or missing env
 * var would hand every visitor admin access. So a production build refuses to
 * start unconfigured rather than quietly degrading into it. Mock mode is
 * therefore unreachable in production by construction.
 */
/**
 * The one escape hatch: the Playwright suite runs a production build with no
 * database. It is opt-in, and named to be alarming, because anyone who sets
 * this on a real deployment has explicitly asked to disable authentication.
 */
const mockModeExplicitlyAllowed =
  process.env.ALLOW_MOCK_MODE_IN_PRODUCTION === "1";

/**
 * Server-only, and deliberately so.
 *
 * This module is imported by client components too, and the browser bundle
 * only receives `NEXT_PUBLIC_*` variables — the opt-out flag above is invisible
 * there. Running this check client-side therefore threw on every page that
 * imported `env`, turning a deployment guard into a broken app. It is a
 * boot-time deployment concern; the server is where it belongs.
 */
if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "production" &&
  !isSupabaseConfigured &&
  !mockModeExplicitlyAllowed
) {
  throw new Error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Production will not fall back to " +
      "mock mode, because that would sign every visitor in as an admin.",
  );
}

export const isMockMode = !isSupabaseConfigured;
