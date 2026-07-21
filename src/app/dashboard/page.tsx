import type { Metadata } from "next";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { ProjectsTable } from "@/features/dashboard/components/ProjectsTable";
import { ActivityFeed } from "@/features/dashboard/components/ActivityFeed";
import { TeamCapacity } from "@/features/dashboard/components/TeamCapacity";
import { RetainerBurn } from "@/features/dashboard/components/RetainerBurn";
import { TimeRangeTabs } from "@/features/dashboard/components/TimeRangeTabs";
import { stats } from "@/features/dashboard/data/mockDashboard";

export const metadata: Metadata = { title: "Agency Operations" };

/** Overview — the showcase dashboard that mirrors the Studio reference. */
export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-body-sm text-ink-muted">Morning, Maxx</p>
          <h1 className="text-display text-ink">Agency Operations · June 2026</h1>
          <p className="mt-1 text-body-sm text-ink-secondary">
            68% blended utilization · 31% avg project margin · 7 active clients ·{" "}
            <span className="font-medium text-danger-text">2 retainers over budget</span>
          </p>
        </div>
        <TimeRangeTabs />
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* Two-column operations grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <ProjectsTable />
          <TeamCapacity />
        </div>
        <div className="flex flex-col gap-4">
          <ActivityFeed />
          <RetainerBurn />
        </div>
      </div>
    </div>
  );
}
