import { describe, expect, test } from "vitest";
import {
  buildImagePath,
  productImageSchema,
  productSchema,
  slugify,
  MAX_IMAGE_BYTES,
} from "./productSchemas";

const valid = {
  name: "Horizon Dashboard Kit",
  slug: "horizon-dashboard-kit",
  summary: "40+ analytics screens.",
  description: "A production-grade dashboard kit.",
  price: "189",
  category: "template",
  rating: "4.8",
  stock: "12",
  isPublished: true,
};

describe("productSchema", () => {
  test("accepts a well-formed product", () => {
    const result = productSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  test("coerces numeric strings from form data", () => {
    const result = productSchema.parse(valid);
    expect(result.price).toBe(189);
    expect(result.stock).toBe(12);
  });

  test("rejects a negative price", () => {
    expect(productSchema.safeParse({ ...valid, price: "-1" }).success).toBe(false);
  });

  test("rejects a fractional stock count", () => {
    expect(productSchema.safeParse({ ...valid, stock: "1.5" }).success).toBe(false);
  });

  test("rejects a rating above five", () => {
    expect(productSchema.safeParse({ ...valid, rating: "6" }).success).toBe(false);
  });

  test("rejects a slug with uppercase or spaces", () => {
    expect(productSchema.safeParse({ ...valid, slug: "Not A Slug" }).success).toBe(false);
  });

  test("rejects an unknown category", () => {
    expect(productSchema.safeParse({ ...valid, category: "weapon" }).success).toBe(false);
  });

  test("rejects a summary longer than the column allows", () => {
    expect(productSchema.safeParse({ ...valid, summary: "x".repeat(201) }).success).toBe(false);
  });
});

describe("slugify", () => {
  test("lowercases and hyphenates", () => {
    expect(slugify("Horizon Dashboard Kit")).toBe("horizon-dashboard-kit");
  });

  test("collapses punctuation and repeated separators", () => {
    expect(slugify("Cobalt  --  Data & Grid!")).toBe("cobalt-data-grid");
  });

  test("trims leading and trailing separators", () => {
    expect(slugify("  ...Verve...  ")).toBe("verve");
  });

  test("produces a slug the schema accepts", () => {
    const slug = slugify("Summit Onboarding Audit");
    expect(productSchema.safeParse({ ...valid, slug }).success).toBe(true);
  });
});

describe("productImageSchema", () => {
  function file(name: string, type: string, size: number): File {
    const blob = new Blob([new Uint8Array(size)], { type });
    return new File([blob], name, { type });
  }

  test("accepts a small PNG", () => {
    expect(productImageSchema.safeParse(file("a.png", "image/png", 1024)).success).toBe(true);
  });

  test("rejects an SVG, which can carry script", () => {
    expect(productImageSchema.safeParse(file("a.svg", "image/svg+xml", 512)).success).toBe(false);
  });

  test("rejects a file over the size cap", () => {
    const oversized = file("big.png", "image/png", MAX_IMAGE_BYTES + 1);
    expect(productImageSchema.safeParse(oversized).success).toBe(false);
  });
});

describe("buildImagePath", () => {
  test("derives the path from the uuid and mime type, not the filename", () => {
    const path = buildImagePath("image/png", "abc-123");
    expect(path).toBe("products/abc-123.png");
  });

  test("cannot be steered out of the products prefix by a hostile filename", () => {
    // The filename never reaches this function — only the validated MIME type
    // and a server-generated uuid do. This is the path-traversal guard.
    const path = buildImagePath("image/jpeg", "def-456");
    expect(path.startsWith("products/")).toBe(true);
    expect(path).not.toContain("..");
  });

  test("falls back to a neutral extension for an unexpected type", () => {
    expect(buildImagePath("application/x-evil", "x")).toBe("products/x.bin");
  });
});
