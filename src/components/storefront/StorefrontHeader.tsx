"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { CartButton } from "@/features/cart/components/CartButton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { siteConfig } from "@/config/site";

/** Public storefront header: brand, primary nav, cart, and sign-in/dashboard link. */
export function StorefrontHeader() {
  const { isAuthenticated } = useAuth();

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
          <Link
            href={isAuthenticated ? siteConfig.homeUrl : siteConfig.loginUrl}
            className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </div>
    </header>
  );
}
