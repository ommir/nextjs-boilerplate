import type { ReactNode } from "react";
import { LayoutGrid } from "lucide-react";
import { siteConfig } from "@/config/site";

/** Centered shell for authentication screens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-brand text-ink-inverse">
            <LayoutGrid className="size-4" aria-hidden />
          </span>
          <span className="text-section text-ink">{siteConfig.name}</span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">{children}</div>

        <p className="mt-6 text-center text-caption text-ink-muted">
          {siteConfig.name} · {siteConfig.tagline}
        </p>
      </div>
    </div>
  );
}
