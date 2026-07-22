"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import type { Profile } from "@/features/auth/types";

interface ProvidersProps {
  /** Resolved on the server in the root layout; `null` when signed out. */
  profile: Profile | null;
  children: ReactNode;
}

/** Client providers mounted once at the root (React Query, auth context). */
export function Providers({ profile, children }: ProvidersProps) {
  // One client per browser session; created lazily so SSR gets a fresh instance.
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider profile={profile}>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
