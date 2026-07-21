import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/global";

const toneStyles: Record<StatusTone, string> = {
  success: "bg-success-soft text-success-text",
  warning: "bg-warning-soft text-warning-text",
  danger: "bg-danger-soft text-danger-text",
  info: "bg-info-soft text-info-text",
  neutral: "bg-surface-muted text-ink-secondary",
};

const dotStyles: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-ink-muted",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  /** Prefix the label with a status dot (DESIGN_SYSTEM.md §8.4). */
  dot?: boolean;
}

/** Status pill. Always pairs color with a readable label — never color alone. */
export function Badge({ tone = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5",
        "text-caption font-semibold whitespace-nowrap",
        toneStyles[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className={cn("size-1.5 rounded-pill", dotStyles[tone])} aria-hidden />}
      {children}
    </span>
  );
}

/** Bare status dot for use inside tables and lists. */
export function StatusDot({ tone = "neutral", className }: { tone?: StatusTone; className?: string }) {
  return <span className={cn("inline-block size-2 rounded-pill", dotStyles[tone], className)} aria-hidden />;
}
