import { expect, test } from "@playwright/test";

test.describe("checkout", () => {
  test("redirects away from an empty cart", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL("/");
  });

  test("places a mock order and clears the cart", async ({ page }) => {
    await page.goto("/products/prd_horizon");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("button", { name: "Check out" }).click();

    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByText("Order summary")).toBeVisible();
    await expect(page.getByText("Demo checkout.")).toBeVisible();

    await page.getByPlaceholder("you@company.com").fill("buyer@example.com");
    await page.getByRole("button", { name: "Place order" }).click();

    await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();
    await expect(page.getByText(/^Reference ORD-/)).toBeVisible();

    await page.goto("/");
    // exact: true — a substring match on "Cart" also catches the drawer's "Close cart" button.
    await expect(page.getByRole("button", { name: "Cart", exact: true })).toBeVisible();
  });

  test("rejects an invalid email", async ({ page }) => {
    await page.goto("/products/prd_horizon");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("button", { name: "Check out" }).click();

    await page.getByPlaceholder("you@company.com").fill("not-an-email");
    await page.getByRole("button", { name: "Place order" }).click();

    // Not scoped via role="alert" — Next.js's own route announcer also has that role on every page.
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });
});
