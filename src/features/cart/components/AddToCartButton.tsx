"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui";
import { useCartStore } from "../store/cartStore";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick" | "children"> {
  productId: string;
}

const FEEDBACK_MS = 1500;

/** Adds a line to the cart, opens the drawer, and shows momentary "Added" feedback. */
export function AddToCartButton({ productId, disabled, ...props }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const id = setTimeout(() => setAdded(false), FEEDBACK_MS);
    return () => clearTimeout(id);
  }, [added]);

  function handleClick() {
    addItem(productId);
    openCart();
    setAdded(true);
  }

  return (
    <Button onClick={handleClick} disabled={disabled || added} {...props}>
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
  );
}
