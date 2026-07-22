import { ProductDetail } from "@/features/product/components/ProductDetail";

/**
 * Public product page. In Next.js 15 `params` is async and must be awaited.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-6">
      <ProductDetail productId={id} />
    </div>
  );
}
