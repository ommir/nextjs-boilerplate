import { expect, test } from "@playwright/test";

async function loginAsDemoUser(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("products", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page);
  });

  test("renders the product catalog as cards", async ({ page }) => {
    await page.goto("/dashboard/products");

    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByText("Horizon Dashboard Kit")).toBeVisible();
  });

  test("filters the catalog by search term", async ({ page }) => {
    await page.goto("/dashboard/products");
    await expect(page.getByText("Horizon Dashboard Kit")).toBeVisible();

    await page.getByPlaceholder("Search products…").fill("icon");

    await expect(page.getByText("Meridian Icon Pack")).toBeVisible();
    await expect(page.getByText("Horizon Dashboard Kit")).not.toBeVisible();
  });

  test("clicking a product card opens its detail route", async ({ page }) => {
    await page.goto("/dashboard/products");
    await page.getByText("Horizon Dashboard Kit").click();

    await expect(page).toHaveURL(/\/dashboard\/products\/prd_horizon/);
    await expect(page.getByRole("heading", { name: "Horizon Dashboard Kit" })).toBeVisible();
  });

  test("lists a previously viewed product as recently viewed on the next detail page", async ({ page }) => {
    await page.goto("/dashboard/products/prd_horizon");
    await expect(page.getByRole("heading", { name: "Horizon Dashboard Kit" })).toBeVisible();

    await page.goto("/dashboard/products/prd_atlas");
    await expect(page.getByRole("heading", { name: "Atlas Auth Module" })).toBeVisible();

    await expect(page.getByText("Recently viewed")).toBeVisible();
    await expect(page.getByRole("link", { name: "Horizon Dashboard Kit" })).toBeVisible();
  });
});
