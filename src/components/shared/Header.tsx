"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Menu, MoreHorizontal, RefreshCw } from "lucide-react";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { useUiStore } from "@/store/ui-store";

export function Header() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const queryClient = useQueryClient();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-canvas px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex size-8 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-surface-hover lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-body-sm">
            {crumbs.map((crumb, index) => (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && <ChevronRight className="size-3.5 text-ink-muted" aria-hidden />}
                <li>
                  {crumb.href ? (
                    <Link href={crumb.href} className="text-ink-secondary hover:text-ink">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink">{crumb.label}</span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => queryClient.invalidateQueries()}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-surface px-2.5 text-caption font-semibold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink"
          title="Refetch all queries"
        >
          <RefreshCw className="size-3.5" aria-hidden />
          Sync
        </button>
        <button
          type="button"
          disabled
          className="flex size-8 items-center justify-center rounded-sm text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          aria-label="More options"
          title="Coming soon"
        >
          <MoreHorizontal className="size-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
