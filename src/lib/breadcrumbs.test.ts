import { describe, expect, it } from "vitest";
import { getBreadcrumbs } from "./breadcrumbs";

describe("getBreadcrumbs", () => {
  it("returns just Products with no href for the dashboard root", () => {
    expect(getBreadcrumbs("/dashboard")).toEqual([{ label: "Products", href: undefined }]);
  });

  it("adds a New product crumb for the create route", () => {
    expect(getBreadcrumbs("/dashboard/products/new")).toEqual([
      { label: "Products", href: "/dashboard" },
      { label: "New product" },
    ]);
  });

  it("adds an Edit product crumb for the edit route", () => {
    expect(getBreadcrumbs("/dashboard/products/prd_horizon/edit")).toEqual([
      { label: "Products", href: "/dashboard" },
      { label: "Edit product" },
    ]);
  });

  it("resolves a known nav item's label for other dashboard routes", () => {
    expect(getBreadcrumbs("/dashboard/settings")).toEqual([
      { label: "Products", href: "/dashboard" },
      { label: "Settings" },
    ]);
  });

  it("falls back to the raw path segment for an unknown route", () => {
    expect(getBreadcrumbs("/dashboard/unknown-section")).toEqual([
      { label: "Products", href: "/dashboard" },
      { label: "unknown-section" },
    ]);
  });
});
