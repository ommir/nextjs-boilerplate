export type ProductCategory = "template" | "plugin" | "asset" | "service";

export interface Product {
  id: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  /** 0–5, one decimal. */
  rating: number;
  /** Units available; 0 means out of stock. */
  stock: number;
}

export interface ProductListParams {
  category?: ProductCategory;
  search?: string;
}
