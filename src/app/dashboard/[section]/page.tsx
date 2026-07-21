import type { Metadata } from "next";
import Link from "next/link";
import { navSections } from "@/config/nav";
import { EmptyState } from "@/components/ui";

function findNavItem(section: string) {
  return navSections.flatMap((s) => s.items).find((i) => i.href === `/dashboard/${section}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  return { title: findNavItem(section)?.label ?? "Section" };
}

/**
 * Shared stub for the remaining sidebar sections (Clients, People, Capacity,
 * Margin, Retainers, Reports, Help, Settings). Keeps navigation complete and
 * demonstrates the empty-state pattern. Replace with real feature routes.
 */
export default async function SectionStubPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const item = findNavItem(section);
  const label = item?.label ?? section;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-display capitalize text-ink">{label}</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">
          This section is a placeholder in the boilerplate.
        </p>
      </div>

      <EmptyState
        icon={item?.icon}
        title={`${label} is coming soon`}
        description="Scaffold a new feature under src/features and add its route here."
        action={
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-sm border border-border bg-surface px-3 text-body-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
          >
            Back to overview
          </Link>
        }
      />
    </div>
  );
}
