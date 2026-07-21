"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Lock, User as UserIcon } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { useAuth } from "../hooks/useAuth";

const MIN_PASSWORD_LENGTH = 8;

export function RegisterForm() {
  const router = useRouter();
  const { register, isAuthenticating, error, clearError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    // Validate at the boundary before hitting the service.
    if (name.trim().length < 2) {
      setLocalError("Please enter your full name.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    try {
      await register({ name: name.trim(), email, password });
      router.push(siteConfig.homeUrl);
    } catch {
      // Surfaced via store error.
    }
  }

  const shownError = localError ?? error;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Full name</span>
        <Input
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearError();
            setLocalError(null);
          }}
          leading={<UserIcon className="size-4" />}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Email</span>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError();
          }}
          leading={<AtSign className="size-4" />}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Password</span>
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
            setLocalError(null);
          }}
          leading={<Lock className="size-4" />}
          required
        />
      </label>

      {shownError && (
        <p className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger-text" role="alert">
          {shownError}
        </p>
      )}

      <Button type="submit" isLoading={isAuthenticating} className="mt-1 w-full">
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
