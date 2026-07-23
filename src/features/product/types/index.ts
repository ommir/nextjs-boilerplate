import type { Database } from "@/lib/supabase/database.types";

/** Derived from the `product_category` enum in Postgres. */
export type ProductCategory = Database["public"]["Enums"]["product_category"];

/** A product row as the rest of the app consumes it. */
export interface Product {
  id: string;
  /** URL key — `/products/[slug]`. */
  slug: string;
  name: string;
  summary: string;
  description: string;
  /**
   * Price in whole currency units (dollars), for display and arithmetic in the
   * UI. Stored in the database as integer cents; the mapper converts.
   */
  price: number;
  category: ProductCategory;
  /** Fully-qualified URL, resolved from the Storage object path. */
  imageUrl: string;
  /** 0–5, one decimal. */
  rating: number;
  /** Units available; 0 means out of stock. */
  stock: number;
  isPublished: boolean;
}

export interface ProductListParams {
  category?: ProductCategory;
  search?: string;
}

/** Shape accepted by create/update — everything but server-assigned fields. */
export interface ProductInput {
  name: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  category: ProductCategory;
  rating: number;
  stock: number;
  imagePath?: string | null;
  isPublished?: boolean;
}
