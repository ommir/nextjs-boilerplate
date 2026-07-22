import { expect, test } from "@playwright/test";

test.describe("cart", () => {
  test("adding a product opens the drawer with a line item and subtotal", async ({ page }) => {
    await page.goto("/products/prd_horizon");

    await page.getByRole("button", { name: "Add to cart" }).click();

    const drawer = page.getByRole("dialog", { name: "Cart" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText("Horizon Dashboard Kit")).toBeVisible();
    // Both the unit price and the subtotal read $189.00 at qty 1 — scope to the Subtotal row specifically.
    await expect(drawer.getByText("Subtotal").locator("..").getByText("$189.00")).toBeVisible();
  });

  test("increasing quantity updates the subtotal", async ({ page }) => {
    await page.goto("/products/prd_horizon");
    await page.getByRole("button", { name: "Add to cart" }).click();

    const drawer = page.getByRole("dialog", { name: "Cart" });
    await drawer.getByRole("button", { name: "Increase quantity of Horizon Dashboard Kit" }).click();

    await expect(drawer.getByText("$378.00")).toBeVisible();
  });

  test("removing the only line shows the empty state", async ({ page }) => {
    await page.goto("/products/prd_horizon");
    await page.getByRole("button", { name: "Add to cart" }).click();

    const drawer = page.getByRole("dialog", { name: "Cart" });
    await drawer.getByRole("button", { name: "Remove Horizon Dashboard Kit" }).click();

    await expect(drawer.getByText("Nothing in the cart yet")).toBeVisible();
  });

  test("closes on Escape and returns focus to the cart trigger", async ({ page }) => {
    await page.goto("/");
    // exact: true — a substring match on "Cart" also catches the drawer's "Close cart" button.
    const trigger = page.getByRole("button", { name: "Cart", exact: true });
    await trigger.click();

    const drawer = page.getByRole("dialog", { name: "Cart" });
    await expect(drawer).toBeVisible();

    await page.keyboard.press("Escape");
    // The panel stays in the DOM, translated off-screen, for the slide-out transition —
    // `inert` (not visual hiding) is what removes it from interaction and the a11y tree.
    await expect(drawer).toHaveAttribute("inert", "");
    await expect(trigger).toBeFocused();
  });

  test("persists the cart across a reload", async ({ page }) => {
    await page.goto("/products/prd_horizon");
    await page.getByRole("button", { name: "Add to cart" }).click();
    await expect(page.getByRole("dialog", { name: "Cart" })).toBeVisible();

    await page.reload();

    await expect(page.getByRole("button", { name: "Cart, 1 item" })).toBeVisible();
  });
});
