import type { ReactNode } from "react";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { CartDrawer } from "@/features/cart/components/CartDrawer";
import { CartSync } from "@/features/cart/components/CartSync";
import { CatalogProvider } from "@/features/product/context/CatalogProvider";
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

/** Public storefront shell: header + content + footer, plus the global cart drawer. */
export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  // Fetched once for the whole storefront so the cart drawer can join names
  // and prices without a second round trip.
  const products = await getProductRepository().list({});

  return (
    <CatalogProvider products={products}>
      <div className="flex min-h-dvh flex-col">
        <StorefrontHeader />
        <main className="flex-1">{children}</main>
        <StorefrontFooter />
        <CartDrawer />
        <CartSync />
      </div>
    </CatalogProvider>
  );
}
