"use client";

import { ShoppingBag } from "lucide-react";
import { selectCartCount, useCartStore } from "../store/cartStore";

/** Header cart trigger — opens the drawer, shows the current line-item count. */
export function CartButton() {
  const items = useCartStore((s) => s.items);
  const toggle = useCartStore((s) => s.toggle);
  const count = selectCartCount(items);

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative flex size-9 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
      aria-label={count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart"}
    >
      <ShoppingBag className="size-[18px]" aria-hidden />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-pill bg-brand text-[10px] font-semibold text-ink-inverse tabular">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
