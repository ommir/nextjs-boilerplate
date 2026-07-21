import { Card, CardHeader, ProgressBar, StatusDot } from "@/components/ui";
import { formatCompactCurrency, formatPercent } from "@/lib/utils";
import { retainers } from "../data/mockDashboard";
import type { StatusTone } from "@/types/global";

function toneForBurn(usedPct: number): StatusTone {
  if (usedPct >= 90) return "danger";
  if (usedPct >= 85) return "warning";
  return "success";
}

/** "Retainer Burn" — used vs. month elapsed. */
export function RetainerBurn() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Retainer Burn" description="Used vs. month elapsed · 70% through June" />

      <ul className="mt-4 flex flex-col gap-4">
        {retainers.map((retainer) => {
          const tone = toneForBurn(retainer.usedPct);
          return (
            <li key={retainer.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusDot tone={tone} />
                  <span className="text-body-sm font-semibold text-ink">{retainer.name}</span>
                  <span className="text-caption text-ink-muted">{retainer.tag}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-caption text-ink-muted tabular">
                    {formatCompactCurrency(retainer.monthly)}/mo
                  </span>
                  <span className="w-10 text-right text-body-sm font-semibold text-ink tabular">
                    {formatPercent(retainer.usedPct)}
                  </span>
                </div>
              </div>
              <ProgressBar value={retainer.usedPct} tone={tone} label="of retainer used" />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
