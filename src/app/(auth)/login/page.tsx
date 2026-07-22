import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-section text-ink">Welcome back</h1>
        <p className="mt-0.5 text-body-sm text-ink-muted">Sign in to your workspace to continue.</p>
      </div>

      {/* LoginForm reads `?from` via useSearchParams, which opts the subtree
          into client-side rendering — the Suspense boundary keeps that from
          de-opting the whole route. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
