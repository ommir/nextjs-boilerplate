"use client";

import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";

interface CheckoutFormProps {
  onPlaceOrder: (email: string) => void;
  isSubmitting?: boolean;
}

/** Simple boundary validation — good enough to demonstrate the pattern, not a full RFC 5322 check. */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Email + a demo notice — deliberately no card fields. A payment-shaped form
 * in a template someone will clone invites it to be wired up as though it
 * were real; this makes the demo boundary explicit instead.
 */
export function CheckoutForm({ onPlaceOrder, isSubmitting = false }: CheckoutFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    onPlaceOrder(email);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Email</span>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError(null);
          }}
          required
        />
      </label>

      {error && (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger-text">
          {error}
        </p>
      )}

      <div className="rounded-sm bg-surface-muted px-3 py-2.5 text-caption text-ink-muted">
        Demo checkout. No payment is taken and no card details are collected. Placing an order just clears your
        cart.
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Place order
      </Button>
    </form>
  );
}
