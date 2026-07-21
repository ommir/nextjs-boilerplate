import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Stat } from "../types";
import type { StatusTone } from "@/types/global";

const deltaText: Record<StatusTone, string> = {
  success: "text-success-text",
  warning: "text-warning-text",
  danger: "text-danger-text",
  info: "text-info-text",
  neutral: "text-ink-muted",
};

/** Metric card — DESIGN_SYSTEM.md §8.2. */
export function StatCard({ stat }: { stat: Stat }) {
  const DeltaIcon = stat.delta.direction === "up" ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="flex flex-col gap-3">
      <p className="text-caption text-ink-secondary">
        {stat.label}
        {stat.sublabel && <span className="text-ink-muted"> · {stat.sublabel}</span>}
      </p>

      <p className="text-metric text-ink tabular">
        {stat.value}
        {stat.unit && <span className="ml-1.5 text-body text-ink-muted">{stat.unit}</span>}
      </p>

      <p className={cn("flex items-center gap-1 text-caption font-medium", deltaText[stat.delta.tone])}>
        <DeltaIcon className="size-3.5" aria-hidden />
        <span className="font-semibold">{stat.delta.magnitude}</span>
        <span className="text-ink-muted">{stat.delta.comparison}</span>
      </p>
    </Card>
  );
}
