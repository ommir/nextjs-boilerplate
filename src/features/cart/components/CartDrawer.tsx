"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { Button, LoadingState } from "@/components/ui";
import { cn, formatCurrency } from "@/lib/utils";
import { useProducts } from "@/features/product/hooks/useProducts";
import type { Product } from "@/features/product/types";
import { useCartStore } from "../store/cartStore";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface CartLineWithProduct {
  productId: string;
  qty: number;
  product: Product;
}

/**
 * Right-side cart drawer. Traps focus and closes on Escape while open,
 * restores focus to whatever triggered it on close (DESIGN_SYSTEM.md §9).
 * Line items are joined from `useProducts()` at render time, so prices and
 * names never drift from the catalog.
 */
export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const pruneMissing = useCartStore((s) => s.pruneMissing);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading, isSuccess } = useProducts();

  // Reconcile the cart against the catalog whenever it loads. Guarded on
  // `isSuccess` so a failed fetch never empties someone's cart.
  useEffect(() => {
    if (!isSuccess || !products) return;
    pruneMissing(products.map((p) => p.id));
  }, [isSuccess, products, pruneMissing]);

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    function getFocusables(): HTMLElement[] {
      return Array.from(panel!.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    }

    getFocusables()[0]?.focus();

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      // Focusing a detached node silently drops focus to <body>, so only
      // restore if the trigger is still in the document.
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen, close]);

  const lines: CartLineWithProduct[] = items.flatMap((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return product ? [{ productId: item.productId, qty: item.qty, product }] : [];
  });

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  function handleCheckout() {
    close();
    router.push("/checkout");
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/25 transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        inert={!isOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-surface shadow-pop",
          "transition-transform duration-200",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-section text-ink">Cart</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            className="flex size-8 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <LoadingState label="Loading cart…" />
          ) : lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <span className="flex size-11 items-center justify-center rounded-pill bg-surface-muted text-ink-muted">
                <ShoppingBag className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-section text-ink">Nothing in the cart yet</p>
                <p className="mt-1 text-body-sm text-ink-muted">Browse the catalog to find something to add.</p>
              </div>
              <Link
                href="/"
                onClick={close}
                className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
              >
                Browse the catalog
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-3">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                    <Image src={line.product.imageUrl} alt={line.product.name} fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-body-sm font-semibold text-ink">{line.product.name}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(line.productId)}
                        aria-label={`Remove ${line.product.name}`}
                        className="text-ink-muted transition-colors hover:text-ink"
                      >
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <span className="text-caption text-ink-muted tabular">{formatCurrency(line.product.price)}</span>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(line.productId, line.qty - 1)}
                        aria-label={`Decrease quantity of ${line.product.name}`}
                        className="flex size-6 items-center justify-center rounded-sm border border-border text-ink-secondary transition-colors hover:bg-surface-hover"
                      >
                        <Minus className="size-3" aria-hidden />
                      </button>
                      <span className="w-6 text-center text-caption text-ink tabular">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(line.productId, line.qty + 1)}
                        aria-label={`Increase quantity of ${line.product.name}`}
                        className="flex size-6 items-center justify-center rounded-sm border border-border text-ink-secondary transition-colors hover:bg-surface-hover"
                      >
                        <Plus className="size-3" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-body-sm font-semibold text-ink">Subtotal</span>
              <span className="text-metric text-ink tabular">{formatCurrency(subtotal)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full">
              Check out
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
