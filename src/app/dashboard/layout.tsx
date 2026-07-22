import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { requireUser } from "@/lib/auth/guards";

/**
 * Protected app shell: sidebar + header + scrollable content.
 *
 * The session check happens here, server-side, via a signature-verified JWT —
 * no client mount-gate, no "Checking your session…" flash. `middleware.ts` is
 * the first line of defense, this is the second, and RLS is the third. Note
 * that this checks the *token*, not merely the presence of a cookie: a cookie
 * anyone can set is not a credential.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-[248px]">
        <Header />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
