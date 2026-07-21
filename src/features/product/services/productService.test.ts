import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils")>();
  return { ...actual, sleep: () => Promise.resolve() };
});

const { productService } = await import("./productService");

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
