import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { AUTH_COOKIE } from "@/lib/cookies";
import { siteConfig } from "@/config/site";

/**
 * Protected app shell: sidebar + header + scrollable content.
 *
 * The session check happens here, server-side, via the same HttpOnly cookie
 * the middleware reads — no client mount-gate, no "Checking your session…"
 * flash. `middleware.ts` is the first line of defense; this is the second.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get(AUTH_COOKIE)?.value) redirect(siteConfig.loginUrl);

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
