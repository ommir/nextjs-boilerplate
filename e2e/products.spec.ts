import { expect, test } from "@playwright/test";

test.describe("storefront catalog", () => {
  test("renders the product catalog as cards", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Production-ready kits for design systems" })).toBeVisible();
    await expect(page.getByText("Horizon Dashboard Kit")).toBeVisible();
  });

  test("filters the catalog by search term", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Horizon Dashboard Kit")).toBeVisible();

    await page.getByPlaceholder("Search products…").fill("icon");

    await expect(page.getByText("Meridian Icon Pack")).toBeVisible();
    await expect(page.getByText("Horizon Dashboard Kit")).not.toBeVisible();
  });

  test("clicking a product card opens its public product page", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Horizon Dashboard Kit").click();

    await expect(page).toHaveURL(/\/products\/prd_horizon/);
    await expect(page.getByRole("heading", { name: "Horizon Dashboard Kit" })).toBeVisible();
  });

  test("lists a previously viewed product as recently viewed on the next product page", async ({ page }) => {
    await page.goto("/products/prd_horizon");
    await expect(page.getByRole("heading", { name: "Horizon Dashboard Kit" })).toBeVisible();

    await page.goto("/products/prd_atlas");
    await expect(page.getByRole("heading", { name: "Atlas Auth Module" })).toBeVisible();

    await expect(page.getByText("Recently viewed")).toBeVisible();
    await expect(page.getByRole("link", { name: "Horizon Dashboard Kit" })).toBeVisible();
  });
});
