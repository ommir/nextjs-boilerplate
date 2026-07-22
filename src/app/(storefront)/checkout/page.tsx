"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui";
import { useProducts } from "@/features/product/hooks/useProducts";
import { useCartStore } from "@/features/cart/store/cartStore";
import { CheckoutForm } from "@/features/cart/components/CheckoutForm";
import { OrderSummary, type OrderLine } from "@/features/cart/components/OrderSummary";
import { OrderConfirmation } from "@/features/cart/components/OrderConfirmation";

function generateOrderReference(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

/** Order summary + mock place-order. Redirects to the catalog if the cart is empty. */
export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const { data: products, isLoading } = useProducts();
  const [orderReference, setOrderReference] = useState<string | null>(null);

  const lines: OrderLine[] = items.flatMap((item) => {
    const product = products?.find((p) => p.id === item.productId);
    return product ? [{ productId: item.productId, qty: item.qty, product }] : [];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  useEffect(() => {
    if (!isLoading && lines.length === 0 && !orderReference) {
      router.replace("/");
    }
  }, [isLoading, lines.length, orderReference, router]);

  function handlePlaceOrder() {
    setOrderReference(generateOrderReference());
    clear();
  }

  if (orderReference) {
    return <OrderConfirmation orderReference={orderReference} />;
  }

  if (isLoading) {
    return <LoadingState label="Loading your cart…" />;
  }

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 px-4 py-10 lg:grid-cols-2 lg:px-6">
      <div>
        <h1 className="mb-5 text-display text-ink">Checkout</h1>
        <CheckoutForm onPlaceOrder={handlePlaceOrder} />
      </div>
      <OrderSummary lines={lines} subtotal={subtotal} />
    </div>
  );
}
