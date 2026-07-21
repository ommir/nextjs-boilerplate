"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** When provided, renders a "Try again" button. */
  onRetry?: () => void;
}

/** Standard error state for failed data loads (spec: error states). */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-danger/40 bg-danger-soft/40 px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-pill bg-danger-soft text-danger-text">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-section text-ink">{title}</p>
        <p className="mt-1 text-body-sm text-ink-muted">{description}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
