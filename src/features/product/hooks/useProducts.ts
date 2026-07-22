"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "../services/productService";
import type { Product, ProductInput, ProductListParams } from "../types";

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

/** Create a product, then refresh every list/detail query. */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/** Update a product, optimistically patching its detail query with rollback on failure. */
export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productService.update(id, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
      const previous = queryClient.getQueryData<Product>(productKeys.detail(id));
      queryClient.setQueryData<Product>(productKeys.detail(id), (old) =>
        old ? { ...old, ...input, id } : old,
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(productKeys.detail(id), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/** Delete a product, optimistically removing it from every cached list with rollback on failure. */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });
      const previousLists = queryClient.getQueriesData<Product[]>({ queryKey: productKeys.all });
      previousLists.forEach(([key, data]) => {
        if (data) queryClient.setQueryData<Product[]>(key, data.filter((p) => p.id !== id));
      });
      return { previousLists };
    },
    onError: (_error, _id, context) => {
      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
