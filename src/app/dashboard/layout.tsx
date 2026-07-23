import type { ReactNode } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { requireAdmin } from "@/lib/auth/guards";

/**
 * Protected app shell: sidebar + header + scrollable content.
 *
 * The whole `/dashboard` subtree is admin-only, so the role check lives here
 * rather than in each page. That matters for more than DRY: guarding at the
 * layout redirects a non-admin *before* this shell renders. Guarding only in
 * the child page let the layout paint first, so a freshly-registered member
 * (default role `member`) briefly saw the dashboard chrome before being
 * bounced to the storefront — the "lands, then a second later jumps home"
 * flash. Redirecting here removes that window entirely.
 *
 * The session check is server-side via a signature-verified JWT — no client
 * mount-gate, no "Checking your session…" flash. `middleware.ts` is the first
 * line of defense, this is the second, and RLS is the third. Each Server
 * Action re-checks `requireAdmin()` independently, so security never depends on
 * this layout having run.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

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
