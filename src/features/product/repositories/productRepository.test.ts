import { beforeEach, describe, expect, test } from "vitest";
import { mockProductRepository, resetMockCatalog } from "./mockProductRepository";
import type { ProductRepository } from "./productRepository";
import type { ProductInput } from "../types";

/**
 * Contract suite for `ProductRepository`.
 *
 * Written against the interface rather than an implementation so the Supabase
 * repository can be run through the identical expectations in an integration
 * environment. That is what keeps the mock path from drifting into a fiction
 * that passes its own tests and nothing else.
 */
function describeProductRepositoryContract(
  name: string,
  repository: ProductRepository,
  reset: () => void | Promise<void>,
) {
  describe(`ProductRepository contract: ${name}`, () => {
    beforeEach(async () => {
      await reset();
    });

    const input: ProductInput = {
      name: "Nimbus Toolkit",
      slug: "nimbus-toolkit",
      summary: "A test product.",
      description: "Created by the contract suite.",
      price: 42.5,
      category: "plugin",
      rating: 4.1,
      stock: 7,
    };

    test("lists the seeded catalog", async () => {
      const products = await repository.list({});
      expect(products.length).toBeGreaterThan(0);
    });

    test("filters by category", async () => {
      const products = await repository.list({ category: "template" });
      expect(products.length).toBeGreaterThan(0);
      expect(products.every((p) => p.category === "template")).toBe(true);
    });

    test("filters by search term across name and summary", async () => {
      const products = await repository.list({ search: "icon" });
      expect(products.some((p) => p.slug === "meridian-icon-pack")).toBe(true);
    });

    test("returns an empty list rather than throwing when nothing matches", async () => {
      expect(await repository.list({ search: "zzzz-no-such-product" })).toEqual([]);
    });

    test("finds a product by slug", async () => {
      const product = await repository.getBySlug("horizon-dashboard-kit");
      expect(product?.name).toBe("Horizon Dashboard Kit");
    });

    test("returns null for an unknown slug", async () => {
      expect(await repository.getBySlug("no-such-product")).toBeNull();
    });

    test("creates a product and makes it retrievable", async () => {
      const created = await repository.create(input, "author-id");
      expect(created.slug).toBe("nimbus-toolkit");

      const found = await repository.getBySlug("nimbus-toolkit");
      expect(found?.id).toBe(created.id);
    });

    test("rejects a duplicate slug", async () => {
      await repository.create(input, "author-id");
      await expect(repository.create(input, "author-id")).rejects.toThrow(/already exists/i);
    });

    test("updates an existing product", async () => {
      const created = await repository.create(input, "author-id");
      const updated = await repository.update(created.id, { ...input, price: 99 });

      expect(updated.price).toBe(99);
      expect((await repository.getById(created.id))?.price).toBe(99);
    });

    test("removes a product", async () => {
      const created = await repository.create(input, "author-id");
      await repository.remove(created.id);

      expect(await repository.getById(created.id)).toBeNull();
    });

    test("does not mutate previously returned objects on update", async () => {
      const created = await repository.create(input, "author-id");
      const snapshot = { ...created };
      await repository.update(created.id, { ...input, name: "Renamed" });

      expect(created).toEqual(snapshot);
    });
  });
}

describeProductRepositoryContract("mock", mockProductRepository, resetMockCatalog);
