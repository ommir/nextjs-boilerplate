import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return { ...actual, sleep: () => Promise.resolve() };
});

const { productService } = await import("./productService");

// Every mock-mode call reads/writes the localStorage-backed catalog, so tests
// must not leak state into one another.
beforeEach(() => {
  window.localStorage.clear();
});

describe("productService.list", () => {
  it("returns the full catalog with no filters", async () => {
    const result = await productService.list();
    expect(result.length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    const result = await productService.list({ category: "plugin" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === "plugin")).toBe(true);
  });

  it("filters by a case-insensitive search term matching the name or summary", async () => {
    const result = await productService.list({ search: "icon" });
    expect(result.some((p) => p.id === "prd_meridian")).toBe(true);
    expect(result.every((p) => p.name.toLowerCase().includes("icon") || p.summary.toLowerCase().includes("icon"))).toBe(true);
  });

  it("returns an empty array when nothing matches", async () => {
    const result = await productService.list({ search: "no-such-product-xyz" });
    expect(result).toEqual([]);
  });

  it("combines category and search filters", async () => {
    const result = await productService.list({ category: "template", search: "horizon" });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("prd_horizon");
  });
});

describe("productService.getById", () => {
  it("returns the matching product", async () => {
    const product = await productService.getById("prd_horizon");
    expect(product.id).toBe("prd_horizon");
  });

  it("throws for a missing id", async () => {
    await expect(productService.getById("does-not-exist")).rejects.toThrow(
      /was not found/,
    );
  });
});

const NEW_PRODUCT_INPUT = {
  name: "Test Widget Kit",
  summary: "A widget kit for testing.",
  description: "Full description.",
  category: "template" as const,
  price: 42,
  stock: 7,
  imageUrl: "https://example.com/widget.png",
  rating: 0,
};

describe("productService.create", () => {
  it("assigns a new id and adds the product to the catalog", async () => {
    const before = await productService.list();
    const created = await productService.create(NEW_PRODUCT_INPUT);

    expect(created.id).toBeTruthy();
    expect(created.name).toBe("Test Widget Kit");

    const after = await productService.list();
    expect(after).toHaveLength(before.length + 1);
    expect(after.some((p) => p.id === created.id)).toBe(true);
  });

  it("persists the new product so a later read sees it", async () => {
    const created = await productService.create(NEW_PRODUCT_INPUT);
    const fetched = await productService.getById(created.id);
    expect(fetched).toEqual(created);
  });
});

describe("productService.update", () => {
  it("replaces the product's fields without changing its id", async () => {
    const created = await productService.create(NEW_PRODUCT_INPUT);
    const updated = await productService.update(created.id, { ...NEW_PRODUCT_INPUT, name: "Renamed Kit", price: 99 });

    expect(updated.id).toBe(created.id);
    expect(updated.name).toBe("Renamed Kit");
    expect(updated.price).toBe(99);
  });

  it("does not mutate the previous object it read", async () => {
    const created = await productService.create(NEW_PRODUCT_INPUT);
    const before = await productService.getById(created.id);
    await productService.update(created.id, { ...NEW_PRODUCT_INPUT, name: "Renamed Kit" });

    expect(before.name).toBe("Test Widget Kit");
  });

  it("throws for a missing id", async () => {
    await expect(productService.update("does-not-exist", NEW_PRODUCT_INPUT)).rejects.toThrow(/was not found/);
  });
});

describe("productService.remove", () => {
  it("removes the product from the catalog", async () => {
    const created = await productService.create(NEW_PRODUCT_INPUT);
    await productService.remove(created.id);

    const after = await productService.list();
    expect(after.some((p) => p.id === created.id)).toBe(false);
  });

  it("makes a later getById for the same id throw", async () => {
    const created = await productService.create(NEW_PRODUCT_INPUT);
    await productService.remove(created.id);

    await expect(productService.getById(created.id)).rejects.toThrow(/was not found/);
  });
});
