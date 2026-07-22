import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Run against a production build, not `next dev`. Dev mode compiles routes
  // on-demand (JIT): as the route count grows, a route's first-ever hit in a
  // freshly started dev server increasingly risks outrunning the test
  // timeout under parallel load — a false failure, not a real bug (we hit
  // this repeatedly while the app grew and kept bumping the timeout instead
  // of fixing the cause). A production build has zero per-route compile cost,
  // so this eliminates the entire flakiness class instead of chasing it.
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // Run the suite in mock mode.
      //
      // These specs assert UI behaviour — cart maths, CRUD flows, navigation —
      // and mock mode makes that deterministic without a database to seed or
      // reset between runs, and without shipping working credentials for a
      // live project in a public repo.
      //
      // Authorization is *not* tested here, deliberately: mock mode signs you
      // in as an admin, so these tests could never prove a member is refused.
      // That belongs in supabase/tests/*.test.sql, where it is asserted against
      // a real Postgres with the real policies.
      //
      // To run this suite against Postgres instead: `npm run db:reset` (which
      // seeds the demo accounts), drop this `env` block, and replace the
      // sign-in helpers with the seeded credentials.
      NEXT_PUBLIC_SUPABASE_URL: "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      // A production build refuses to boot unconfigured, because that would
      // sign every visitor in as an admin. This is the deliberate, loudly
      // named opt-out for the test suite — never set it on a real deployment.
      ALLOW_MOCK_MODE_IN_PRODUCTION: "1",
    },
  },
});
