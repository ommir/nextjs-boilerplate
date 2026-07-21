import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Optional action, e.g. a Button or Link. */
  action?: ReactNode;
  className?: string;
}

/** Neutral empty/placeholder state (DESIGN_SYSTEM.md §8; spec: empty states). */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-pill bg-surface-muted text-ink-muted">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-section text-ink">{title}</p>
        {description && <p className="mt-1 text-body-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
