"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ShoppingCart, Star } from "lucide-react";
import { Badge, Button, Card, ErrorState, LoadingState } from "@/components/ui";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatCurrency } from "@/lib/utils";
import { useProduct } from "../hooks/useProducts";

const RECENTLY_VIEWED_KEY = "studio-recently-viewed-products";
const RECENTLY_VIEWED_LIMIT = 4;

function RecentlyViewedLink({ id }: { id: string }) {
  const { data: product } = useProduct(id);
  if (!product) return null;

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="shrink-0 rounded-sm border border-border bg-surface px-2.5 py-1 text-caption font-semibold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
    >
      {product.name}
    </Link>
  );
}

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading, isError, refetch } = useProduct(productId);
  const [added, setAdded] = useState(false);
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
    <div className="flex flex-col gap-5">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1.5 text-body-sm text-ink-secondary hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to products
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
              <Badge tone="info">{product.category}</Badge>
              <span className="flex items-center gap-1 text-caption text-ink-secondary">
                <Star className="size-3.5 fill-warning text-warning" aria-hidden />
                {product.rating.toFixed(1)}
              </span>
            </div>
            <h1 className="text-display text-ink">{product.name}</h1>
            <p className="text-body text-ink-secondary">{product.summary}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-metric text-ink tabular">{formatCurrency(product.price)}</span>
            {isOutOfStock ? (
              <Badge tone="danger">Sold out</Badge>
            ) : (
              <span className="text-body-sm text-ink-muted">{product.stock} available</span>
            )}
          </div>

          <p className="text-body-sm leading-relaxed text-ink-secondary">{product.description}</p>

          <div className="mt-1 flex gap-2">
            <Button
              onClick={() => setAdded(true)}
              disabled={isOutOfStock || added}
              className="min-w-40"
            >
              {added ? (
                <>
                  <Check className="size-4" aria-hidden /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="size-4" aria-hidden /> Add to cart
                </>
              )}
            </Button>
            <Button variant="secondary" disabled={isOutOfStock}>
              Buy now
            </Button>
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
    </div>
  );
}
