import { clamp } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types/global";

interface ProgressBarProps {
  /** Percentage value. May exceed 100 (e.g. utilization); the fill caps at 100%. */
  value: number;
  /** Override the auto-escalated tone. */
  tone?: StatusTone;
  /** Human-readable context appended to the announced value, e.g. "utilization". */
  label?: string;
  className?: string;
}

const fillStyles: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-ink-muted",
};

/**
 * Escalate tone by value when not explicitly set (DESIGN_SYSTEM.md §2.4):
 * < 85% success, 85–99% warning, >= 100% danger.
 */
function toneForValue(value: number): StatusTone {
  if (value >= 100) return "danger";
  if (value >= 85) return "warning";
  return "success";
}

/** Thin capacity/burn bar. */
export function ProgressBar({ value, tone, label, className }: ProgressBarProps) {
  const resolvedTone = tone ?? toneForValue(value);
  const width = clamp(value, 0, 100);
  const rounded = Math.round(value);

  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-pill bg-surface-muted", className)}
      role="progressbar"
      aria-valuenow={rounded}
      aria-valuemin={0}
      aria-valuemax={Math.max(100, rounded)}
      aria-valuetext={`${rounded}%${label ? ` ${label}` : ""}`}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-pill transition-[width] duration-500", fillStyles[resolvedTone])}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
