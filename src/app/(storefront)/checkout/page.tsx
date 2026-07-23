import type { Metadata } from "next";
import { CheckoutFlow } from "@/features/cart/components/CheckoutFlow";

export const metadata: Metadata = { title: "Checkout" };

/** Order summary + place-order. Redirects to the catalog if the cart is empty. */
export default function CheckoutPage() {
  return <CheckoutFlow />;
}
