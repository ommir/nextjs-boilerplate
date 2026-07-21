import {
  AlertTriangle,
  CalendarPlus,
  CheckCircle2,
  FileSignature,
  Percent,
  type LucideIcon,
} from "lucide-react";
import { Badge, Card, CardHeader } from "@/components/ui";
import { activity } from "../data/mockDashboard";
import type { ActivityType } from "../types";

const iconByType: Record<ActivityType, LucideIcon> = {
  booking: CalendarPlus,
  alert: AlertTriangle,
  margin: Percent,
  closed: CheckCircle2,
  change_order: FileSignature,
};

/** "Recent Activity" feed — DESIGN_SYSTEM.md §8.6. */
export function ActivityFeed() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Recent Activity" description="Bookings, budgets, margins, and syncs" />

      <ul className="mt-4 flex flex-col">
        {activity.map((item, index) => {
          const Icon = iconByType[item.type];
          const isLast = index === activity.length - 1;
          return (
            <li key={item.id} className="flex gap-3">
              {/* Icon rail with a connecting line. */}
              <div className="flex flex-col items-center">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-surface-muted text-ink-secondary">
                  <Icon className="size-3.5" aria-hidden />
                </span>
                {!isLast && <span className="w-px flex-1 bg-border-subtle" aria-hidden />}
              </div>

              <div className={isLast ? "" : "pb-4"}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-body-sm text-ink">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-ink-secondary"> — {item.detail}</span>
                  </p>
                  {item.tag && (
                    <Badge tone={item.tag.tone} dot>
                      {item.tag.label}
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 text-caption text-ink-muted">{item.timestamp}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
