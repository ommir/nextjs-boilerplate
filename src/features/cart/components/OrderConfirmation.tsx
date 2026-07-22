import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

interface OrderConfirmationProps {
  orderReference: string;
}

/** Post-checkout confirmation. No real order exists server-side — this is a demo flow. */
export function OrderConfirmation({ orderReference }: OrderConfirmationProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-pill bg-success-soft text-success-text">
        <CheckCircle2 className="size-6" aria-hidden />
      </span>
      <h1 className="text-display text-ink">Order placed</h1>
      <p className="text-body-sm text-ink-secondary">
        Reference <span className="font-semibold text-ink tabular">{orderReference}</span>. This is a demo order —
        nothing was charged.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex h-9 items-center rounded-sm bg-brand px-4 text-body-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        Back to the catalog
      </Link>
    </div>
  );
}
