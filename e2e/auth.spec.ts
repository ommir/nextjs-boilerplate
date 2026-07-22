import { expect, test } from "@playwright/test";

/**
 * Auth-surface smoke tests.
 *
 * This suite runs in mock mode (see playwright.config.ts), where there is no
 * database and the app treats you as a signed-in admin. That makes the UI
 * assertions below deterministic — but it also means these tests say nothing
 * about *authorization*.
 *
 * Who may read or write what is asserted in `supabase/tests/*.test.sql`
 * against a real Postgres with the real policies, because that is the only
 * place the answer is actually decided.
 */
test.describe("auth screens", () => {
  test("renders the sign-in form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByPlaceholder("you@company.com")).toBeVisible();
  });

  test("does not pre-fill credentials", async ({ page }) => {
    await page.goto("/login");

    // The old boilerplate shipped a pre-filled demo account. Real auth means an
    // empty form — a filled one would mean credentials got hardcoded again.
    await expect(page.getByPlaceholder("you@company.com")).toHaveValue("");
  });

  test("offers registration and password recovery", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("link", { name: "Create one" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Forgot your password?" })).toBeVisible();
  });

  test("renders the registration form", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
    await expect(page.getByPlaceholder("At least 10 characters")).toBeVisible();
  });

  test("renders the password reset request form", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  });

  test("rejects a malformed email on the reset form", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByPlaceholder("you@company.com").fill("not-an-email");
    await page.getByRole("button", { name: "Send reset link" }).click();

    // Not scoped via role="alert": Next.js's route announcer also has that
    // role on every page, so the locator would be ambiguous.
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });
});
