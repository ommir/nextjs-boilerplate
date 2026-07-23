import { ProductsTable } from "@/features/product/components/ProductsTable";
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

/**
 * Dashboard Products CRUD index — the storefront catalog's admin surface.
 * Admin access is enforced by the dashboard layout; admins also see drafts,
 * because the RLS policy grants them a second SELECT path.
 */
export default async function DashboardProductsPage() {
  const products = await getProductRepository().list({});

  return <ProductsTable products={products} />;
}
