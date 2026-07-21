import { Badge, Card, CardHeader, Table, TBody, TD, TH, THead, TR } from "@/components/ui";
import { formatCompactCurrency, formatPercent } from "@/lib/utils";
import { projects } from "../data/mockDashboard";

/** "Projects By Client" table — the primary data panel of the overview. */
export function ProjectsTable() {
  return (
    <Card flush>
      <div className="p-5 pb-3">
        <CardHeader
          title="Projects By Client"
          description="Off-plan first · margin health flagged"
          action={
            <button
              type="button"
              disabled
              title="Coming soon"
              className="rounded-sm border border-border bg-surface px-2.5 py-1 text-caption font-semibold text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              All Projects
            </button>
          }
        />
      </div>

      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH className="w-8 pl-5">#</TH>
            <TH>Project</TH>
            <TH align="right">Fee</TH>
            <TH align="right">Spent</TH>
            <TH align="right">Margin</TH>
            <TH align="right">Left</TH>
            <TH className="pr-5">Status</TH>
          </TR>
        </THead>
        <TBody>
          {projects.map((project, index) => (
            <TR key={project.id}>
              <TD className="pl-5 text-ink-muted tabular">{index + 1}</TD>
              <TD>
                <span className="font-semibold text-ink">{project.name}</span>
                <span className="block text-caption text-ink-muted">{project.client}</span>
              </TD>
              <TD align="right" className="tabular text-ink">
                {formatCompactCurrency(project.fee)}
              </TD>
              <TD align="right" className="tabular">
                {formatCompactCurrency(project.spent)}
              </TD>
              <TD align="right" className="tabular">
                {formatPercent(project.marginPct)}
              </TD>
              <TD align="right" className="tabular">
                {formatCompactCurrency(project.left)}
              </TD>
              <TD className="pr-5">
                <Badge tone={project.status.tone} dot>
                  {project.status.label}
                </Badge>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </Card>
  );
}
