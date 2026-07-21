import type { Metadata } from "next";
import { ProductList } from "@/features/product/components/ProductList";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-display text-ink">Products</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">
          Templates, plugins, and services in your catalog.
        </p>
      </div>
      <ProductList />
    </div>
  );
}
