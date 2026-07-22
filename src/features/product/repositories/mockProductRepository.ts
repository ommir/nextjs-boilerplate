import { mockProducts } from "../data/mockProducts";
import type { Product, ProductInput, ProductListParams } from "../types";
import type { ProductRepository } from "./productRepository";

/**
 * In-memory products for mock mode (no Supabase configured).
 *
 * Server-side rather than localStorage-backed, because reads and writes now
 * happen on the server where there is no `window`. Writes survive for the life
 * of the dev server process, which is what a "try it without a backend" mode
 * needs.
 *
 * The store hangs off `globalThis` rather than being a plain module-level
 * `let`. Next.js bundles a Server Action that is imported by a *client*
 * component separately from the RSC page graph, and each bundle gets its own
 * instance of the module — so a plain `let` meant `deleteProductAction`
 * mutated one copy while the dashboard rendered from another. The action
 * returned 200 and the row never disappeared. Pinning the state to a single
 * global is the same trick used for dev-time database client singletons.
 *
 * Every mutation replaces the array instead of mutating rows in place, so a
 * previously returned `Product` is never altered under the caller's feet.
 */
const CATALOG_KEY = Symbol.for("studio.mock.catalog");

type CatalogGlobal = typeof globalThis & { [CATALOG_KEY]?: Product[] };

function getCatalog(): Product[] {
  const store = globalThis as CatalogGlobal;
  store[CATALOG_KEY] ??= [...mockProducts];
  return store[CATALOG_KEY];
}

function setCatalog(next: Product[]): void {
  (globalThis as CatalogGlobal)[CATALOG_KEY] = next;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return crypto.randomUUID();
}

function matches(product: Product, { category, search }: ProductListParams): boolean {
  const term = search?.trim().toLowerCase();
  const matchesCategory = !category || product.category === category;
  const matchesSearch =
    !term ||
    product.name.toLowerCase().includes(term) ||
    product.summary.toLowerCase().includes(term);
  return matchesCategory && matchesSearch;
}

export const mockProductRepository: ProductRepository = {
  async list(params: ProductListParams): Promise<Product[]> {
    await delay(120);
    return getCatalog().filter((product) => matches(product, params));
  },

  async getBySlug(slug: string): Promise<Product | null> {
    await delay(100);
    return getCatalog().find((product) => product.slug === slug) ?? null;
  },

  async getById(id: string): Promise<Product | null> {
    await delay(100);
    return getCatalog().find((product) => product.id === id) ?? null;
  },

  async create(input: ProductInput): Promise<Product> {
    await delay(100);

    if (getCatalog().some((product) => product.slug === input.slug)) {
      // Mirrors the unique constraint the real repository relies on, so the
      // contract tests can assert one behaviour for both implementations.
      throw new Error("A product with that slug already exists.");
    }

    const product: Product = {
      id: generateId(),
      slug: input.slug,
      name: input.name,
      summary: input.summary,
      description: input.description,
      price: input.price,
      category: input.category,
      imageUrl: "https://picsum.photos/seed/studio-product/640/400",
      rating: input.rating,
      stock: input.stock,
      isPublished: input.isPublished ?? true,
    };
    setCatalog([product, ...getCatalog()]);
    return product;
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    await delay(100);
    const current = getCatalog();
    const index = current.findIndex((product) => product.id === id);
    if (index === -1) throw new Error(`Product "${id}" was not found.`);

    const existing = current[index]!;
    const updated: Product = {
      ...existing,
      slug: input.slug,
      name: input.name,
      summary: input.summary,
      description: input.description,
      price: input.price,
      category: input.category,
      rating: input.rating,
      stock: input.stock,
      isPublished: input.isPublished ?? existing.isPublished,
    };
    setCatalog([...current.slice(0, index), updated, ...current.slice(index + 1)]);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay(80);
    setCatalog(getCatalog().filter((product) => product.id !== id));
  },
};

/** Test hook: restore the seed catalog between cases. */
export function resetMockCatalog(): void {
  setCatalog([...mockProducts]);
}
