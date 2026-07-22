import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

/**
 * `env.ts` validates at module-evaluation time, so each case has to re-import
 * it with a fresh module registry.
 */
async function loadEnv(overrides: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return import("./env");
}

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_APP_NAME;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("env configuration", () => {
  test("falls back to mock mode when Supabase is not configured", async () => {
    const { isMockMode, isSupabaseConfigured } = await loadEnv({});

    expect(isSupabaseConfigured).toBe(false);
    expect(isMockMode).toBe(true);
  });

  test("reports configured when both url and publishable key are present", async () => {
    const { isMockMode, isSupabaseConfigured, env } = await loadEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc123",
    });

    expect(isSupabaseConfigured).toBe(true);
    expect(isMockMode).toBe(false);
    expect(env.supabaseUrl).toBe("https://example.supabase.co");
  });

  test("stays in mock mode when only half the config is present", async () => {
    const { isSupabaseConfigured } = await loadEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });

    // A URL with no key would otherwise produce confusing runtime 401s rather
    // than an obvious "you are in mock mode".
    expect(isSupabaseConfigured).toBe(false);
  });

  test("refuses to boot when a secret key is used as the publishable key", async () => {
    await expect(
      loadEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_supersecretvalue",
      }),
    ).rejects.toThrow(/SECRET key/i);
  });

  test("refuses to boot on a malformed Supabase URL", async () => {
    await expect(
      loadEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc123",
      }),
    ).rejects.toThrow(/Invalid environment configuration/);
  });
});
