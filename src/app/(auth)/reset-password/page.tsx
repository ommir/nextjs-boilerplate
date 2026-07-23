import type { Metadata } from "next";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-section text-ink">Choose a new password</h1>
        <p className="mt-0.5 text-body-sm text-ink-muted">
          Pick something you haven&apos;t used elsewhere.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
