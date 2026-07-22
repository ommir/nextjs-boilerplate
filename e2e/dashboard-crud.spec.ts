import { expect, test } from "@playwright/test";

async function loginAsDemoUser(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("dashboard products CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemoUser(page);
  });

  test("creates a product and it appears in the table", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "New product" }).click();
    await expect(page).toHaveURL(/\/dashboard\/products\/new/);

    await page.getByPlaceholder("Horizon Dashboard Kit").fill("Test Widget Kit");
    await page.getByPlaceholder("One-line pitch shown on the catalog card").fill("A widget kit for testing.");
    await page.getByPlaceholder("189").fill("42");
    await page.getByPlaceholder("12").fill("7");
    await page.getByPlaceholder("https://…").fill("https://picsum.photos/seed/testwidget/640/400");
    await page.getByRole("button", { name: "Create product" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Test Widget Kit")).toBeVisible();
    await expect(page.getByText("$42.00")).toBeVisible();
  });

  test("creation survives a reload", async ({ page }) => {
    await page.goto("/dashboard/products/new");
    await page.getByPlaceholder("Horizon Dashboard Kit").fill("Persisted Kit");
    await page.getByPlaceholder("One-line pitch shown on the catalog card").fill("Should survive a reload.");
    await page.getByPlaceholder("189").fill("10");
    await page.getByPlaceholder("12").fill("1");
    await page.getByPlaceholder("https://…").fill("https://picsum.photos/seed/persisted/640/400");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.reload();

    await expect(page.getByText("Persisted Kit")).toBeVisible();
  });

  test("edits an existing product", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Edit Horizon Dashboard Kit" }).click();
    await expect(page).toHaveURL(/\/edit/);

    const nameInput = page.getByPlaceholder("Horizon Dashboard Kit");
    await nameInput.fill("Horizon Dashboard Kit Pro");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Horizon Dashboard Kit Pro")).toBeVisible();
  });

  test("cancelling delete confirmation keeps the product", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Delete Horizon Dashboard Kit" }).click();
    await expect(page.getByText("Delete product")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("Delete product")).not.toBeVisible();
    await expect(page.getByText("Horizon Dashboard Kit")).toBeVisible();
  });

  test("confirming delete removes the product", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Delete Horizon Dashboard Kit" }).click();
    await expect(page.getByText('"Horizon Dashboard Kit" will be removed')).toBeVisible();

    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page.getByText("Horizon Dashboard Kit", { exact: true })).not.toBeVisible();
  });
});
