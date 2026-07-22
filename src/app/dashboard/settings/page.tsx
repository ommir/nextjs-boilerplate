import type { Metadata } from "next";
import { Settings as SettingsIcon } from "lucide-react";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Settings" };

/**
 * Admin-only stub (see `config/nav.ts` — `roles: ["admin"]`). Kept as a real
 * route, not the old generic `[section]` catch-all, specifically to
 * demonstrate role-based nav filtering with a working destination.
 */
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-display text-ink">Settings</h1>
        <p className="mt-1 text-body-sm text-ink-secondary">Visible to admins only.</p>
      </div>
      <EmptyState
        icon={SettingsIcon}
        title="Nothing to configure yet"
        description="This boilerplate ships one example admin route. Extend it with real settings for your app."
      />
    </div>
  );
}
