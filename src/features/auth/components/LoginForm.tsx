"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AtSign, Lock } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { signInAction } from "../actions/authActions";
import type { AuthActionResult } from "../types";

type State = AuthActionResult | null;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_previous, formData) => {
      const result = await signInAction(formData);
      if (result.ok) {
        // `from` is set by the middleware when it bounces an unauthenticated
        // request. It comes from the URL, so only same-origin relative paths
        // are honoured — otherwise this is an open redirect.
        const from = searchParams.get("from");
        const safeFrom = from?.startsWith("/") && !from.startsWith("//") ? from : null;
        // Fall back by role: admins to the dashboard, everyone else to the
        // storefront. Sending a member to `/dashboard` only bounces them back.
        const fallback = result.isAdmin ? siteConfig.homeUrl : siteConfig.storefrontUrl;
        router.replace(safeFrom ?? fallback);
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
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
          autoComplete="current-password"
          placeholder="••••••••"
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
        Sign in
      </Button>

      <div className="flex flex-col gap-1.5 text-center text-body-sm text-ink-muted">
        <Link href="/forgot-password" className="font-semibold text-ink hover:underline">
          Forgot your password?
        </Link>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-ink hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
}
