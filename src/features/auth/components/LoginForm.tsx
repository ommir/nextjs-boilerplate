"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Lock } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { useAuth } from "../hooks/useAuth";
import { DEMO_CREDENTIALS } from "../services/authService";

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticating, error, clearError } = useAuth();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login({ email, password });
      router.push(siteConfig.homeUrl);
    } catch {
      // Error is surfaced via the store; nothing else to do here.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Email</span>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) clearError();
          }}
          leading={<AtSign className="size-4" />}
          required
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-body-sm font-semibold text-ink">Password</span>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) clearError();
          }}
          leading={<Lock className="size-4" />}
          required
        />
      </label>

      {error && (
        <p className="rounded-sm bg-danger-soft px-3 py-2 text-body-sm text-danger-text" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" isLoading={isAuthenticating} className="mt-1 w-full">
        Sign in
      </Button>

      <p className="text-center text-body-sm text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-ink hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
