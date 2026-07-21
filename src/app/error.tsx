"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Wire to your telemetry (Sentry, etc.) here.
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred while rendering this page."
        onRetry={reset}
      />
    </div>
  );
}
