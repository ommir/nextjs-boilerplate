import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { categoryMeta } from "../lib/category";
import { StockSignal } from "./StockSignal";
import type { Product } from "../types";

/** Presentational grid card. Links through to the public product page. */
export function ProductCard({ product }: { product: Product }) {
  const meta = categoryMeta[product.category];

  return (
    <Link
      href={`/products/${product.slug}`}
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
          <StockSignal stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
