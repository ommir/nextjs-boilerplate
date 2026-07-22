import type { Metadata } from "next";
import { Hero } from "@/features/product/components/Hero";
import { ProductList } from "@/features/product/components/ProductList";

export const metadata: Metadata = { title: "Studio" };

/** Storefront landing: hero statement, then the full catalog. */
export default function StorefrontLandingPage() {
  return (
    <div className="flex flex-col">
      <Hero />

      <section id="catalog" className="mx-auto w-full max-w-6xl scroll-mt-14 px-4 py-12 lg:px-6">
        <h2 className="mb-5 text-display text-ink">Catalog</h2>
        <ProductList />
      </section>
    </div>
  );
}
