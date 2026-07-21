"use client";

import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import type { ProductListParams } from "../types";

/** Query keys for the product feature — centralised to avoid typos and enable invalidation. */
export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductListParams) => [...productKeys.all, "list", params] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};

/** Fetch the product list (stale-while-revalidate via React Query). */
export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productService.list(params),
  });
}

/** Fetch a single product by id. */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: Boolean(id),
  });
}
