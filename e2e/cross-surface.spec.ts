import { expect, test } from "@playwright/test";

/**
 * The storefront and the dashboard read and write the same product catalog.
 * Every other spec exercises one surface in isolation, which is exactly how
 * the cart/badge divergence and the lost-focus bug both shipped unnoticed.
 */

/**
 * The suite runs in mock mode, where the app treats you as a signed-in admin,
 * so reaching the dashboard is a navigation rather than a sign-in. Real
 * authorization is asserted in supabase/tests/*.test.sql.
 */
async function openDashboard(page: import("@playwright/test").Page) {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
}

/**
 * Create a product this test owns.
 *
 * The mock catalog lives in the server process, so it is shared across the
 * whole run. Deleting a *seeded* product here would break whichever test ran
 * next; each destructive test therefore brings its own.
 */
async function createProduct(
  page: import("@playwright/test").Page,
  name: string,
  price = "25",
  stock = "4",
) {
  await page.goto("/dashboard/products/new");
  await page.getByPlaceholder("Horizon Dashboard Kit").fill(name);
  await page
    .getByPlaceholder("One-line pitch shown on the catalog card")
    .fill(`Summary for ${name}.`);
  await page
    .getByPlaceholder("Full product description shown on the product page")
    .fill(`Full description for ${name}.`);
  await page.getByPlaceholder("189").fill(price);
  await page.getByPlaceholder("12").fill(stock);
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("storefront <-> dashboard", () => {
  test("deleting a product in the dashboard clears it from an existing cart", async ({ page }) => {
    await openDashboard(page);
    await createProduct(page, "Cart Clearing Kit");

    await page.goto("/products/cart-clearing-kit");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("dialog", { name: "Cart" })).toBeVisible();
    await expect(page.locator("header button[aria-label^='Cart']")).toHaveAttribute(
      "aria-label",
      "Cart, 1 item",
    );

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Delete Cart Clearing Kit" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    // Wait for the dialog to close, not for the row to vanish: the row goes
    // immediately via the optimistic update, while the dialog stays open until
    // the mutation actually resolves and persists. Navigating on the optimistic
    // signal would race the write.
    await expect(page.getByRole("alertdialog")).not.toBeVisible();

    await page.goto("/");
    // The badge must not keep counting a line the drawer can no longer render,
    // which would leave a permanently stuck, unclearable cart.
    const cartTrigger = page.locator("header button[aria-label^='Cart']");
    await expect(cartTrigger).toHaveAttribute("aria-label", "Cart");

    await cartTrigger.click();
    await expect(page.getByRole("dialog", { name: "Cart" }).getByText("Nothing in the cart yet")).toBeVisible();
  });

  test("a cart holding a still-valid product is left alone", async ({ page }) => {
    await page.goto("/products/atlas-auth-module");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("dialog", { name: "Cart" })).toBeVisible();

    await page.goto("/");
    await expect(page.locator("header button[aria-label^='Cart']")).toHaveAttribute(
      "aria-label",
      "Cart, 1 item",
    );
  });

  test("deleting a product keeps focus in the page instead of dropping it to the body", async ({ page }) => {
    await openDashboard(page);
    await createProduct(page, "Focus Probe Kit");

    await page.getByRole("button", { name: "Delete Focus Probe Kit" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByRole("alertdialog")).not.toBeVisible();

    // The row's own delete button is gone by now, so focus must land on the
    // declared fallback anchor rather than dropping to <body>. The deletion
    // triggers a router refresh, so give the restored focus a moment to settle
    // rather than sampling it mid-rerender.
    await expect
      .poll(async () => page.evaluate(() => document.activeElement?.tagName ?? "NONE"))
      .not.toBe("BODY");
  });

  test("a product created in the dashboard shows up on the storefront", async ({ page }) => {
    await openDashboard(page);

    await page.goto("/dashboard/products/new");
    await page.getByPlaceholder("Horizon Dashboard Kit").fill("Cross Surface Kit");
    await page.getByPlaceholder("One-line pitch shown on the catalog card").fill("Created in the dashboard.");
    await page
      .getByPlaceholder("Full product description shown on the product page")
      .fill("Full description created in the dashboard.");
    await page.getByPlaceholder("189").fill("25");
    await page.getByPlaceholder("12").fill("4");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.goto("/");
    await expect(page.getByText("Cross Surface Kit")).toBeVisible();
    // Stock of 4 is inside the low-stock band, so the signal must say so.
    await expect(page.getByText("Only 4 left").first()).toBeVisible();
  });
});
