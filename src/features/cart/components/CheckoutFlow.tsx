"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCatalog } from "@/features/product/context/CatalogProvider";
import { placeOrderAction } from "../actions/cartActions";
import { CheckoutForm } from "./CheckoutForm";
import { OrderConfirmation } from "./OrderConfirmation";
import { OrderSummary, type OrderLine } from "./OrderSummary";
import { useCartHydrated } from "../hooks/useCartHydrated";
import { useCartStore } from "../store/cartStore";

/**
 * Checkout: summary on one side, email + place-order on the other.
 *
 * Note what is *not* sent to the server: prices. The action forwards line ids
 * and quantities, and `place_order()` recomputes every total from the products
 * table. A tampered request can change what you buy, never what it costs.
 */
export function CheckoutFlow() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const products = useCatalog();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const isHydrated = useCartHydrated();

  const [reference, setReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlacing, startPlacing] = useTransition();

  const lines: OrderLine[] = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product ? [{ productId: item.productId, qty: item.qty, product }] : [];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  useEffect(() => {
    // Guarded on hydration: before the persisted cart is read back, `lines` is
    // empty for reasons that have nothing to do with the user's cart.
    if (isHydrated && lines.length === 0 && !reference) router.replace("/");
  }, [isHydrated, lines.length, reference, router]);

  function handlePlaceOrder(email: string) {
    setError(null);
    startPlacing(async () => {
      const result = await placeOrderAction(
        items.map((item) => ({ product_id: item.productId, qty: item.qty })),
        email,
      );

      if (result.ok) {
        setReference(result.reference);
        clear();
        // Stock moved, so any cached catalog page is now stale.
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (reference) return <OrderConfirmation orderReference={reference} />;
  if (!isHydrated || lines.length === 0) return null;

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-2 lg:px-6">
      <div>
        <h1 className="mb-5 text-display text-ink">Checkout</h1>

        {isAuthenticated ? (
          <CheckoutForm onPlaceOrder={handlePlaceOrder} isSubmitting={isPlacing} error={error} />
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
            <p className="text-body-sm text-ink-secondary">
              Orders are tied to an account so you can look them up later. Sign in to finish
              checking out — your cart will be waiting.
            </p>
            <Link
              href="/login?from=/checkout"
              className="inline-flex h-9 w-fit items-center rounded-sm bg-brand px-4 text-body-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
            >
              Sign in to continue
            </Link>
          </div>
        )}
      </div>

      <OrderSummary lines={lines} subtotal={subtotal} />
    </div>
  );
}
