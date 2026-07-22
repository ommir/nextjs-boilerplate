import { describe, expect, test } from "vitest";
import { toProduct, toProductInsert, resolveImageUrl } from "./productMapper";
import type { ProductRowSelection } from "./productMapper";
import type { ProductInput } from "../types";

const row: ProductRowSelection = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "horizon-dashboard-kit",
  name: "Horizon Dashboard Kit",
  summary: "40+ analytics screens.",
  description: "A production-grade dashboard kit.",
  price_cents: 18900,
  category: "template",
  image_path: "products/abc.png",
  rating: 4.8,
  stock: 12,
  is_published: true,
};

describe("toProduct", () => {
  test("converts integer cents to a dollar amount", () => {
    expect(toProduct(row).price).toBe(189);
  });

  test("converts a fractional price without losing the cents", () => {
    expect(toProduct({ ...row, price_cents: 1999 }).price).toBe(19.99);
  });

  test("resolves the storage path to a public URL", () => {
    expect(toProduct(row).imageUrl).toContain("/product-images/products/abc.png");
  });

  test("falls back to a placeholder when there is no image", () => {
    expect(toProduct({ ...row, image_path: null }).imageUrl).toMatch(/^https:\/\//);
  });

  test("carries the publication flag through", () => {
    expect(toProduct({ ...row, is_published: false }).isPublished).toBe(false);
  });
});

describe("toProductInsert", () => {
  const input: ProductInput = {
    name: "Test",
    slug: "test",
    summary: "s",
    description: "d",
    price: 19.99,
    category: "plugin",
    rating: 4,
    stock: 3,
  };

  test("rounds cents rather than truncating them", () => {
    // 19.99 * 100 is 1998.9999999999998 in IEEE 754; truncating would
    // silently undercharge by a cent.
    expect(toProductInsert(input).price_cents).toBe(1999);
  });

  test("handles a whole-dollar price", () => {
    expect(toProductInsert({ ...input, price: 189 }).price_cents).toBe(18900);
  });

  test("defaults to published when the flag is omitted", () => {
    expect(toProductInsert(input).is_published).toBe(true);
  });

  test("round-trips a price through both mappers unchanged", () => {
    const inserted = toProductInsert(input);
    const product = toProduct({ ...row, price_cents: inserted.price_cents! });
    expect(product.price).toBe(19.99);
  });
});

describe("resolveImageUrl", () => {
  test("passes through an absolute URL untouched", () => {
    const url = "https://picsum.photos/seed/x/640/400";
    expect(resolveImageUrl(url)).toBe(url);
  });
});
