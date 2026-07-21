import {
  Avatar,
  Badge,
  Card,
  CardHeader,
  ProgressBar,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { capacity } from "../data/mockDashboard";

/** "Team Capacity · Next Week" — overbooked first. */
export function TeamCapacity() {
  return (
    <Card flush>
      <div className="p-5 pb-3">
        <CardHeader
          title="Team Capacity · Next Week"
          description="Overbooked first · hours booked vs. available"
          action={
            <button
              type="button"
              disabled
              title="Coming soon"
              className="rounded-sm border border-border bg-surface px-2.5 py-1 text-caption font-semibold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              Capacity Planner
            </button>
          }
        />
      </div>

      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="pl-5">Person</TH>
            <TH>Team</TH>
            <TH align="right">Booked</TH>
            <TH className="w-40">Utilization</TH>
            <TH className="pr-5">Signal</TH>
          </TR>
        </THead>
        <TBody>
          {capacity.map((row) => (
            <TR key={row.id}>
              <TD className="pl-5">
                <div className="flex items-center gap-2.5">
                  <Avatar name={row.person} size="sm" />
                  <div>
                    <span className="font-semibold text-ink">{row.person}</span>
                    <span className="block text-caption text-ink-muted">{row.role}</span>
                  </div>
                </div>
              </TD>
              <TD>{row.teams}</TD>
              <TD align="right" className="tabular">
                {row.bookedHours}h
              </TD>
              <TD>
                <div className="flex items-center gap-2">
                  <ProgressBar value={row.utilizationPct} label="utilization" className="w-24" />
                  <span className="w-10 text-right text-caption tabular text-ink-secondary">
                    {row.utilizationPct}%
                  </span>
                </div>
              </TD>
              <TD className="pr-5">
                <Badge tone={row.signal.tone} dot>
                  {row.signal.label}
                </Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
