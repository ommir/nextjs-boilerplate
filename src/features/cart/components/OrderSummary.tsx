import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/features/product/types";

export interface OrderLine {
  productId: string;
  qty: number;
  product: Product;
}

interface OrderSummaryProps {
  lines: OrderLine[];
  subtotal: number;
}

/** Read-only order summary — line items, subtotal, and total. */
export function OrderSummary({ lines, subtotal }: OrderSummaryProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="mb-4 text-section text-ink">Order summary</h2>
      <ul className="flex flex-col gap-3">
        {lines.map((line) => (
          <li key={line.productId} className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-muted">
              <Image src={line.product.imageUrl} alt={line.product.name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-body-sm font-semibold text-ink">{line.product.name}</p>
              <p className="text-caption text-ink-muted">Qty {line.qty}</p>
            </div>
            <span className="text-body-sm text-ink tabular">{formatCurrency(line.product.price * line.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2 border-t border-border-subtle pt-4">
        <div className="flex items-center justify-between text-body-sm text-ink-secondary">
          <span>Subtotal</span>
          <span className="tabular">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-body-sm font-semibold text-ink">Total</span>
          <span className="text-metric text-ink tabular">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}
