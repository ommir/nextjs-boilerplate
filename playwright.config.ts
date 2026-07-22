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
  },
});
