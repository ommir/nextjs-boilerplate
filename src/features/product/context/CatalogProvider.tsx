"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "../types";

/**
 * Publishes the server-rendered catalog to client components.
 *
 * The cart stores line items only — `{ productId, qty }`. Names, prices and
 * images are joined in from here at render time, so a cart can never show a
 * stale price: there is only one copy of that data and the server owns it.
 */
const CatalogContext = createContext<Product[]>([]);

export function CatalogProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  return <CatalogContext.Provider value={products}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): Product[] {
  return useContext(CatalogContext);
}
