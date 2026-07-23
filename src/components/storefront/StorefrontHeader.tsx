"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { CartButton } from "@/features/cart/components/CartButton";
import { signOutAction } from "@/features/auth/actions/authActions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { siteConfig } from "@/config/site";

const CTA_CLASS =
  "inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-semibold text-ink transition-colors hover:bg-surface-hover";

/**
 * Public storefront header: brand, primary nav, cart, and a role-aware CTA.
 *
 * The CTA is deliberately not a simple signed-in/out toggle. `/dashboard` is
 * the admin Products CRUD and every route under it is admin-only, so a member
 * shown a "Dashboard" link would click it, land on the shell, and get bounced
 * straight back to the storefront. So: guests sign in, admins get the
 * dashboard, and signed-in members get a way to sign out (they have no
 * dashboard to go to, and "Sign in" would be nonsense while authenticated).
 */
export function StorefrontHeader() {
  const { isAuthenticated, hasRole } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-canvas">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-ink-inverse">
            <LayoutGrid className="size-4" aria-hidden />
          </span>
          <span className="text-section text-ink">{siteConfig.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
          <Link href="/#catalog" className="text-body-sm text-ink-secondary transition-colors hover:text-ink">
            Catalog
          </Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <CartButton />
          {!isAuthenticated ? (
            <Link href={siteConfig.loginUrl} className={CTA_CLASS}>
              Sign in
            </Link>
          ) : hasRole("admin") ? (
            <Link href={siteConfig.homeUrl} className={CTA_CLASS}>
              Dashboard
            </Link>
          ) : (
            // Sign-out is a form post to a Server Action: the session lives in
            // HttpOnly cookies only the server can clear.
            <form action={signOutAction}>
              <button type="submit" className={CTA_CLASS}>
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
