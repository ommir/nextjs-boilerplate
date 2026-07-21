import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductCategory } from "../types";
import type { StatusTone } from "@/types/global";

const categoryMeta: Record<ProductCategory, { label: string; tone: StatusTone }> = {
  template: { label: "Template", tone: "neutral" },
  plugin: { label: "Plugin", tone: "info" },
  asset: { label: "Asset", tone: "warning" },
  service: { label: "Service", tone: "success" },
};

/** Presentational grid card. Links through to the product detail route. */
export function ProductCard({ product }: { product: Product }) {
  const meta = categoryMeta[product.category];
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-xs transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-muted">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-2.5 top-2.5">
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-body font-semibold text-ink">{product.name}</h3>
          <span className="flex items-center gap-1 text-caption text-ink-secondary">
            <Star className="size-3.5 fill-warning text-warning" aria-hidden />
            {product.rating.toFixed(1)}
          </span>
        </div>
        <p className="line-clamp-2 flex-1 text-body-sm text-ink-secondary">{product.summary}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-body font-semibold text-ink tabular">{formatCurrency(product.price)}</span>
          {isOutOfStock ? (
            <Badge tone="danger">Sold out</Badge>
          ) : (
            <span className="text-caption text-ink-muted">{product.stock} in stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
