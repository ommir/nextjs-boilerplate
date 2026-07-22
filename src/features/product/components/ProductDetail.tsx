"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Badge, Card, ErrorState, LoadingState } from "@/components/ui";
import { AddToCartButton } from "@/features/cart/components/AddToCartButton";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatCurrency } from "@/lib/utils";
import { categoryMeta } from "../lib/category";
import { StockSignal } from "./StockSignal";
import { useProduct } from "../hooks/useProducts";

const RECENTLY_VIEWED_KEY = "studio-recently-viewed-products";
const RECENTLY_VIEWED_LIMIT = 4;

function RecentlyViewedLink({ id }: { id: string }) {
  const { data: product } = useProduct(id);
  if (!product) return null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="shrink-0 rounded-sm border border-border bg-surface px-2.5 py-1 text-caption font-semibold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
    >
      {product.name}
    </Link>
  );
}

/** Spec row for the details table — a hairline key/value pair (DESIGN_SYSTEM.md §8.3). */
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-2.5 last:border-0">
      <span className="text-label text-ink-muted uppercase">{label}</span>
      <span className="text-body-sm text-ink">{value}</span>
    </div>
  );
}

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage<string[]>(RECENTLY_VIEWED_KEY, []);

  useEffect(() => {
    if (!product) return;
    setRecentlyViewed((prev) => [product.id, ...prev.filter((id) => id !== product.id)].slice(0, RECENTLY_VIEWED_LIMIT));
    // Only re-run when the viewed product changes, not on every store update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (isLoading) return <LoadingState label="Loading product…" />;
  if (isError || !product) {
    return (
      <ErrorState
        title="Product unavailable"
        description="This product could not be loaded."
        onRetry={() => refetch()}
      />
    );
  }

  const isOutOfStock = product.stock === 0;
  const otherRecentlyViewed = recentlyViewed.filter((id) => id !== product.id);

  return (
    <div className="flex flex-col gap-8">
      <Link href="/#catalog" className="inline-flex items-center gap-1.5 text-body-sm text-ink-secondary hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        Back to catalog
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card flush className="overflow-hidden">
          <div className="relative aspect-[16/10] bg-surface-muted">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge tone={categoryMeta[product.category].tone}>{categoryMeta[product.category].label}</Badge>
              <span className="flex items-center gap-1 text-caption text-ink-secondary">
                <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                {product.rating.toFixed(1)}
              </span>
            </div>
            <h1 className="text-display text-ink">{product.name}</h1>
            <p className="text-body text-ink-secondary">{product.summary}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-metric text-ink tabular">{formatCurrency(product.price)}</span>
            <StockSignal stock={product.stock} />
          </div>

          <AddToCartButton productId={product.id} disabled={isOutOfStock} className="w-fit min-w-40" />

          <div className="mt-2 rounded-lg border border-border bg-surface px-4">
            <SpecRow label="Category" value={categoryMeta[product.category].label} />
            <SpecRow label="Rating" value={`${product.rating.toFixed(1)} / 5`} />
            <SpecRow label="Availability" value={isOutOfStock ? "Sold out" : `${product.stock} in stock`} />
          </div>

          {otherRecentlyViewed.length > 0 && (
            <div className="mt-2 flex flex-col gap-2">
              <span className="text-caption font-semibold text-ink-muted uppercase">Recently viewed</span>
              <div className="flex flex-wrap gap-2">
                {otherRecentlyViewed.map((id) => (
                  <RecentlyViewedLink key={id} id={id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl">
        <h2 className="mb-2 text-section text-ink">About this product</h2>
        <p className="text-body-sm leading-relaxed text-ink-secondary">{product.description}</p>
      </div>
    </div>
  );
}
