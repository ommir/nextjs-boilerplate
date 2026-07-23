import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-section text-ink">Reset your password</h1>
        <p className="mt-0.5 text-body-sm text-ink-muted">
          We&apos;ll email you a link to choose a new one.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
