import type { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-section text-ink">Create your account</h1>
        <p className="mt-0.5 text-body-sm text-ink-muted">Start operating your agency in minutes.</p>
      </div>

      <RegisterForm />
    </div>
  );
}
