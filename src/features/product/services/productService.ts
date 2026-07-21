import { apiRequest } from "@/lib/api-client";
import { isMockMode } from "@/config/env";
import { sleep } from "@/lib/utils";
import { mockProducts } from "../data/mockProducts";
import type { Product, ProductListParams } from "../types";

function filterMock({ category, search }: ProductListParams): Product[] {
  const term = search?.trim().toLowerCase();
  return mockProducts.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const matchesSearch =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.summary.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
}

/**
 * Product data access. Serves filtered mock data with a simulated latency in
 * mock mode, and hits `GET /products` against a real API otherwise.
 */
export const productService = {
  async list(params: ProductListParams = {}): Promise<Product[]> {
    if (isMockMode) {
      await sleep(500);
      return filterMock(params);
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
      const product = mockProducts.find((p) => p.id === id);
      if (!product) throw new Error(`Product "${id}" was not found.`);
      return product;
    }
    return apiRequest<Product>(`/products/${id}`);
  },
};
