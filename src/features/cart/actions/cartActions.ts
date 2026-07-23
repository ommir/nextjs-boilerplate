"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/guards";
import { isMockMode } from "@/config/env";

/**
 * Cart and checkout Server Actions.
 *
 * The cart itself lives in localStorage while browsing — that is what makes
 * +/- feel instant and gives guests a cart at all. These actions are the
 * server side of it: they sync line items, and run the checkout.
 */

const cartItemsSchema = z
  .array(
    z.object({
      product_id: z.uuid(),
      qty: z.number().int().min(1).max(99),
    }),
  )
  .max(100, "That cart is too large.");

export type CheckoutResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

export interface CartLinePayload {
  product_id: string;
  qty: number;
}

/**
 * Fold a guest cart into the signed-in user's server cart, summing quantities.
 * Called once after sign-in.
 */
export async function mergeGuestCartAction(items: CartLinePayload[]): Promise<void> {
  if (isMockMode) return;

  const user = await getCurrentUser();
  if (!user) return;

  const parsed = cartItemsSchema.safeParse(items);
  if (!parsed.success || parsed.data.length === 0) return;

  const supabase = await createClient();
  await supabase.rpc("merge_guest_cart", { p_items: parsed.data });
}

/**
 * Place an order.
 *
 * Two steps, deliberately: `replace_cart` makes the server cart match what the
 * user sees, then `place_order` reads *that* — never the request body — to
 * compute totals and move stock. The client therefore chooses quantities but
 * never prices, which is what keeps a tampered request from buying a $1200
 * audit for a dollar.
 */
export async function placeOrderAction(
  items: CartLinePayload[],
  email: string,
): Promise<CheckoutResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "Sign in to complete your order." };
  }

  if (isMockMode) {
    // No database to write to; keep the flow demonstrable.
    return { ok: true, reference: `STU-${Date.now().toString(16).toUpperCase().slice(-8)}` };
  }

  const parsedItems = cartItemsSchema.safeParse(items);
  if (!parsedItems.success || parsedItems.data.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const supabase = await createClient();

  const { error: syncError } = await supabase.rpc("replace_cart", {
    p_items: parsedItems.data,
  });
  if (syncError) {
    return { ok: false, error: "Could not prepare your order. Try again." };
  }

  const { data, error } = await supabase.rpc("place_order", { p_email: email });

  if (error) {
    return { ok: false, error: translateOrderError(error.message) };
  }

  const order = Array.isArray(data) ? data[0] : null;
  if (!order) {
    return { ok: false, error: "The order could not be completed." };
  }

  revalidatePath("/");
  return { ok: true, reference: order.order_reference };
}

/**
 * Map the sentinel errors raised by place_order() onto something a shopper can
 * act on. The raw message is never shown — it would leak slugs and internals.
 */
function translateOrderError(message: string): string {
  if (message.includes("INSUFFICIENT_STOCK")) {
    return "One of your items just sold out. Adjust your cart and try again.";
  }
  if (message.includes("PRODUCT_UNAVAILABLE")) {
    return "One of your items is no longer available. Remove it and try again.";
  }
  if (message.includes("CART_EMPTY")) return "Your cart is empty.";
  if (message.includes("INVALID_EMAIL")) return "Enter a valid email address.";
  if (message.includes("AUTH_REQUIRED")) return "Sign in to complete your order.";
  return "The order could not be completed. Try again.";
}
