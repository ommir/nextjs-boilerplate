import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Inline loading spinner. */
export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("size-4 animate-spin text-ink-muted", className)} aria-label="Loading" role="status" />
  );
}

/** Full-panel loading state for cards and route bodies. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-ink-muted">
      <Spinner className="size-5" />
      <p className="text-body-sm">{label}</p>
    </div>
  );
}
