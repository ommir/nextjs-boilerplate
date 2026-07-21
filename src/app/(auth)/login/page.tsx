import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-section text-ink">Welcome back</h1>
        <p className="mt-0.5 text-body-sm text-ink-muted">Sign in to your workspace to continue.</p>
      </div>

      <LoginForm />

      <p className="mt-5 rounded-sm bg-surface-muted px-3 py-2 text-caption text-ink-muted">
        Demo mode — credentials are pre-filled. Any email and password will sign you in.
      </p>
    </div>
  );
}
