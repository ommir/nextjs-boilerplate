"use client";

import { cn } from "@/lib/utils";
import { useUiStore, type TimeRange } from "@/store/ui-store";

const options: { value: TimeRange; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "next-week", label: "Next Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
];

/** Segmented time-range control — DESIGN_SYSTEM.md §8.7. Backed by the UI store. */
export function TimeRangeTabs() {
  const timeRange = useUiStore((s) => s.timeRange);
  const setTimeRange = useUiStore((s) => s.setTimeRange);

  return (
    <div className="inline-flex rounded-pill bg-surface-muted p-1" role="tablist" aria-label="Time range">
      {options.map((option) => {
        const active = option.value === timeRange;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTimeRange(option.value)}
            className={cn(
              "rounded-pill px-3 py-1 text-caption font-semibold transition-colors",
              active ? "bg-surface text-ink shadow-xs" : "text-ink-secondary hover:text-ink",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
