import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/features/product/components/ProductForm";
import { updateProductAction } from "@/features/product/actions/productActions";
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

// Admin access is enforced by the dashboard layout; updateProductAction
// re-checks it independently.
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductRepository().getById(id);

  if (!product) notFound();

  async function action(formData: FormData) {
    "use server";
    const result = await updateProductAction(id, formData);
    if (result.ok) redirect("/dashboard");
    return result;
  }

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-body-sm text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to products
      </Link>

      <div>
        <h1 className="text-display text-ink">Edit product</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">{product.name}</p>
      </div>

      <ProductForm initialValue={product} action={action} submitLabel="Save changes" />
    </div>
  );
}
