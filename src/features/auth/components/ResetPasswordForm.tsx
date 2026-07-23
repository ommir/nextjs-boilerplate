"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { updatePasswordAction } from "../actions/authActions";
import type { AuthActionResult } from "../types";

type State = AuthActionResult | null;

/**
 * Reached only through the recovery link, which the /auth/callback route has
 * already exchanged for a short-lived session. The action re-checks that
 * session server-side rather than trusting arrival at this page.
 */
export function ResetPasswordForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<State, FormData>(
    async (_previous, formData) => {
      const result = await updatePasswordAction(formData);
      if (result.ok) {
        router.replace(siteConfig.homeUrl);
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">New password</span>
        <Input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 10 characters"
          leading={<Lock className="size-4" />}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Confirm password</span>
        <Input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat it"
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
        Update password
      </Button>
    </form>
  );
}
