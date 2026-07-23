import { isMockMode } from "@/config/env";
import type { Product, ProductInput, ProductListParams } from "../types";
import { supabaseProductRepository } from "./supabaseProductRepository";
import { mockProductRepository } from "./mockProductRepository";

/**
 * Product data access.
 *
 * The mock/real split lives here and nowhere else. The previous service
 * branched on `isMockMode` inside all five methods; with four entities that
 * pattern would have meant ~20 branches to keep in sync. One interface and one
 * selection point means the mock implementation is exercised by the same
 * contract tests as the real one, so it cannot quietly rot.
 */
export interface ProductRepository {
  list(params: ProductListParams): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  create(input: ProductInput, authorId: string): Promise<Product>;
  update(id: string, input: ProductInput): Promise<Product>;
  remove(id: string): Promise<void>;
}

export function getProductRepository(): ProductRepository {
  return isMockMode ? mockProductRepository : supabaseProductRepository;
}
