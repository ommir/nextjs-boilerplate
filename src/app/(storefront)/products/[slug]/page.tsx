import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/features/product/components/ProductDetail";
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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductRepository().getBySlug(slug);
  if (!product) return { title: "Product not found" };

  return { title: product.name, description: product.summary };
}

/**
 * Public product page.
 *
 * An unpublished product is invisible here for free: RLS filters it out of the
 * query, so `getBySlug` returns null and this 404s — there is no
 * `is_published` check in application code to forget.
 */
export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductRepository().getBySlug(slug);

  if (!product) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-6">
      <ProductDetail product={product} />
    </div>
  );
}
