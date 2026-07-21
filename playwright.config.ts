import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  reporter: "html",
  // Next's dev server compiles routes on-demand (JIT). A route's first-ever
  // hit in a freshly started dev server — e.g. /api/auth/login the moment the
  // suite starts — can take longer to compile+respond than the default 5s
  // expect timeout, causing a false failure with no retry margin. 10s covers
  // that cold-compile cost; a CI run against a production build wouldn't need
  // it, but it's harmless there too.
  expect: {
    timeout: 10_000,
  },
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
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
