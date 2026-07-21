import { describe, expect, it } from "vitest";
import { getBreadcrumbs } from "./breadcrumbs";

describe("getBreadcrumbs", () => {
  it("returns just Overview / Agency Operations for the dashboard root", () => {
    expect(getBreadcrumbs("/dashboard")).toEqual([
      { label: "Overview", href: "/dashboard" },
      { label: "Agency Operations" },
    ]);
  });

  it("resolves a known section label and drops its href at the list level", () => {
    expect(getBreadcrumbs("/dashboard/products")).toEqual([
      { label: "Overview", href: "/dashboard" },
      { label: "Products", href: undefined },
    ]);
  });

  it("keeps the section href and appends Detail for a nested route", () => {
    expect(getBreadcrumbs("/dashboard/products/abc-123")).toEqual([
      { label: "Overview", href: "/dashboard" },
      { label: "Products", href: "/dashboard/products" },
      { label: "Detail" },
    ]);
  });

  it("falls back to the raw path segment for an unknown section", () => {
    expect(getBreadcrumbs("/dashboard/unknown-section")).toEqual([
      { label: "Overview", href: "/dashboard" },
      { label: "unknown-section", href: undefined },
    ]);
  });
});
