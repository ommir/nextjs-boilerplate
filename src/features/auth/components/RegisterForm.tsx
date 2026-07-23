"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AtSign, CheckCircle2, Lock, User as UserIcon } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { signUpAction } from "../actions/authActions";
import type { AuthActionResult } from "../types";

type State = AuthActionResult | null;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    (_previous, formData) => signUpAction(formData),
    null,
  );

  // Sign-up ends at "check your email", not at a session — the account is not
  // usable until the address is confirmed.
  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-pill bg-success-soft text-success-text">
          <CheckCircle2 className="size-5" aria-hidden />
        </span>
        <h2 className="text-body font-semibold text-ink">Almost there</h2>
        <p className="text-body-sm text-ink-secondary">{state.message}</p>
        <Link href="/login" className="mt-1 text-body-sm font-semibold text-ink hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Full name</span>
        <Input
          name="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          leading={<UserIcon className="size-4" />}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Email</span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          leading={<AtSign className="size-4" />}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Password</span>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 10 characters"
          leading={<Lock className="size-4" />}
          required
        />
      </label>

      {state && !state.ok && (
        <p className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger-text" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" isLoading={isPending} className="mt-1 w-full">
        Create account
      </Button>

      <p className="text-center text-body-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
