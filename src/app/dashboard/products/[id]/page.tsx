import { ProductDetail } from "@/features/product/components/ProductDetail";

/**
 * Product detail route. In Next.js 15 `params` is async and must be awaited.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetail productId={id} />;
}
