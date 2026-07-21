"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LogOut, Search } from "lucide-react";
import { Avatar } from "@/components/ui";
import { navSections } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUiStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

function isItemActive(pathname: string, href: string): boolean {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasRole, logout } = useAuth();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  // The drawer's open/closed state is only meaningful below `lg` (CSS pins it
  // open above that). Reset it on breakpoint change so resizing narrow while
  // it's open — then back to mobile width later — doesn't resurrect a stale
  // open drawer + backdrop.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  useEffect(() => {
    if (isDesktop) setSidebarOpen(false);
  }, [isDesktop, setSidebarOpen]);

  async function handleLogout() {
    await logout();
    router.push(siteConfig.loginUrl);
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-ink/25 transition-opacity lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-border bg-surface",
          "transition-transform duration-200 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 px-4">
          <span className="flex size-7 items-center justify-center rounded-md bg-brand text-ink-inverse">
            <LayoutGrid className="size-4" aria-hidden />
          </span>
          <span className="text-section text-ink">{siteConfig.name}</span>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex h-9 w-full items-center gap-2 rounded-sm bg-surface-muted px-2.5 text-ink-muted transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-60"
          >
            <Search className="size-4" aria-hidden />
            <span className="text-body-sm">Search…</span>
            <kbd className="ml-auto rounded border border-border bg-surface px-1.5 text-[10px] font-medium text-ink-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-2" aria-label="Main navigation">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-2 pb-1.5 text-label text-ink-muted uppercase">{section.title}</p>
              <ul className="flex flex-col gap-0.5">
                {section.items
                  .filter((item) => !item.roles || hasRole(...item.roles))
                  .map((item) => {
                    const active = isItemActive(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-body-sm transition-colors",
                            active
                              ? "bg-surface-muted font-semibold text-ink"
                              : "text-ink-secondary hover:bg-surface-hover hover:text-ink",
                          )}
                        >
                          <Icon className="size-[18px] shrink-0" aria-hidden />
                          <span className="flex-1">{item.label}</span>
                          {item.badge !== undefined && (
                            <span className="rounded-pill bg-surface-muted px-1.5 text-caption text-ink-muted tabular">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User chip */}
        <div className="flex items-center gap-2.5 border-t border-border px-3 py-3">
          <Avatar name={user?.name ?? "Guest"} src={user?.avatarUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-semibold text-ink">{user?.name ?? "Guest"}</p>
            <p className="truncate text-caption text-ink-muted">{user?.email ?? ""}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex size-8 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </div>
      </aside>
    </>
  );
}
