import type { Metadata } from "next";
import { Hero } from "@/features/product/components/Hero";
import { ProductList } from "@/features/product/components/ProductList";
import { getProductRepository } from "@/features/product/repositories/productRepository";

/**
 * Rendered per request.
 *
 * These pages read mutable data (catalog, stock levels). With Supabase
 * configured they are dynamic anyway, because resolving the session touches
 * cookies. In mock mode nothing touches cookies, so Next would happily
 * prerender them at build time and then serve a catalog frozen at build —
 * every create/edit/delete invisible until the next deploy. Stating it
 * explicitly makes both modes behave the same.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Studio" };

/** Storefront landing: hero statement, then the full catalog. */
export default async function StorefrontLandingPage() {
  // Anonymous visitors reach this too. RLS returns published rows only, so
  // there is no draft-filtering to remember here.
  const products = await getProductRepository().list({});

  return (
    <div className="flex flex-col">
      <Hero />

      <section id="catalog" className="mx-auto w-full max-w-6xl scroll-mt-14 px-4 py-12 lg:px-6">
        <h2 className="mb-5 text-display text-ink">Catalog</h2>
        <ProductList products={products} />
      </section>
    </div>
  );
}
