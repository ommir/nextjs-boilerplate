import { expect, test, type Page } from "@playwright/test";

/**
 * The suite runs in mock mode, where the app treats you as a signed-in admin,
 * so reaching the dashboard is a navigation rather than a sign-in. Real
 * authorization is asserted in supabase/tests/*.test.sql.
 */
async function openDashboard(page: Page) {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
}

/**
 * Create a product and return its name.
 *
 * Every destructive test below acts on a product it created itself. That is
 * not ceremony: the mock catalog now lives in the *server* process rather than
 * in each browser's localStorage, so it is shared across the whole run. A test
 * that renamed or deleted a seeded product would quietly break whichever test
 * happened to run next.
 */
async function createProduct(page: Page, name: string, price = "42", stock = "7") {
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
  return name;
}

test.describe("dashboard products CRUD", () => {
  test("creates a product and it appears in the table", async ({ page }) => {
    await openDashboard(page);
    const name = await createProduct(page, "Test Widget Kit", "42", "7");

    await expect(page.getByText(name)).toBeVisible();
    await expect(page.getByText("$42.00")).toBeVisible();
  });

  test("creation survives a reload", async ({ page }) => {
    const name = await createProduct(page, "Persisted Kit", "10", "1");

    await page.reload();

    await expect(page.getByText(name)).toBeVisible();
  });

  test("derives a url slug from the product name", async ({ page }) => {
    await page.goto("/dashboard/products/new");
    await page.getByPlaceholder("Horizon Dashboard Kit").fill("Slug Derivation Kit");

    await expect(page.getByPlaceholder("horizon-dashboard-kit")).toHaveValue(
      "slug-derivation-kit",
    );
  });

  test("rejects a product with no summary", async ({ page }) => {
    await page.goto("/dashboard/products/new");
    await page.getByPlaceholder("Horizon Dashboard Kit").fill("Incomplete Kit");
    await page.getByPlaceholder("189").fill("5");
    await page.getByRole("button", { name: "Create product" }).click();

    // Server-side zod validation, surfaced per field.
    await expect(page.getByText("Enter a short summary.")).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/products\/new$/);
  });

  test("edits an existing product", async ({ page }) => {
    const name = await createProduct(page, "Editable Kit");

    await page.getByRole("link", { name: `Edit ${name}` }).click();
    await expect(page).toHaveURL(/\/edit/);

    await page.getByPlaceholder("Horizon Dashboard Kit").fill("Editable Kit Pro");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Editable Kit Pro")).toBeVisible();
  });

  test("cancelling delete confirmation keeps the product", async ({ page }) => {
    const name = await createProduct(page, "Kept Kit");

    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.getByText("Delete product")).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("Delete product")).not.toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
  });

  test("confirming delete removes the product", async ({ page }) => {
    const name = await createProduct(page, "Doomed Kit");

    await page.getByRole("button", { name: `Delete ${name}` }).click();
    await expect(page.getByText(`"${name}" will be removed`)).toBeVisible();

    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page.getByText(name, { exact: true })).not.toBeVisible();
  });
});
