import { apiRequest } from "@/lib/api-client";
import { isMockMode } from "@/config/env";
import { sleep } from "@/lib/utils";
import { mockProducts } from "../data/mockProducts";
import type { Product, ProductInput, ProductListParams } from "../types";

const STORAGE_KEY = "studio-product-catalog";

/**
 * localStorage-backed mock "database". Seeds from `mockProducts` on first
 * read in the browser; every create/update/delete persists here so the
 * dashboard CRUD example survives a reload with no real backend. Falls back
 * to the seed array on the server (SSR) and when storage is unavailable.
 */
function readCatalog(): Product[] {
  if (typeof window === "undefined") return mockProducts;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch {
    // Corrupt storage — fall back to the seed catalog below.
  }
  writeCatalog(mockProducts);
  return mockProducts;
}

function writeCatalog(products: Product[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Ignore write failures (private mode, quota).
  }
}

function generateId(): string {
  return `prd_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function filterMock(products: Product[], { category, search }: ProductListParams): Product[] {
  const term = search?.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const matchesSearch =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.summary.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
}

/**
 * Product data access. Serves the localStorage-backed mock catalog with a
 * simulated latency in mock mode, and hits the real API otherwise.
 */
export const productService = {
  async list(params: ProductListParams = {}): Promise<Product[]> {
    if (isMockMode) {
      await sleep(500);
      return filterMock(readCatalog(), params);
    }
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return apiRequest<Product[]>(`/products${qs ? `?${qs}` : ""}`);
  },

  async getById(id: string): Promise<Product> {
    if (isMockMode) {
      await sleep(400);
      const product = readCatalog().find((p) => p.id === id);
      if (!product) throw new Error(`Product "${id}" was not found.`);
      return product;
    }
    return apiRequest<Product>(`/products/${id}`);
  },

  async create(input: ProductInput): Promise<Product> {
    if (isMockMode) {
      await sleep(400);
      const product: Product = { ...input, id: generateId() };
      writeCatalog([product, ...readCatalog()]);
      return product;
    }
    return apiRequest<Product>("/products", { method: "POST", body: input });
  },

  async update(id: string, input: ProductInput): Promise<Product> {
    if (isMockMode) {
      await sleep(400);
      const catalog = readCatalog();
      const index = catalog.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`Product "${id}" was not found.`);
      const updated: Product = { ...input, id };
      writeCatalog([...catalog.slice(0, index), updated, ...catalog.slice(index + 1)]);
      return updated;
    }
    return apiRequest<Product>(`/products/${id}`, { method: "PATCH", body: input });
  },

  async remove(id: string): Promise<void> {
    if (isMockMode) {
      await sleep(300);
      writeCatalog(readCatalog().filter((p) => p.id !== id));
      return;
    }
    await apiRequest<void>(`/products/${id}`, { method: "DELETE" });
  },
};
