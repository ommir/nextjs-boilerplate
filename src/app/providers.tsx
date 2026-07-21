"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client";
// Imported for its side effect: registers the auth token resolver on the API client.
import "@/features/auth/store/authStore";

/** Client providers mounted once at the root (React Query, and room for more). */
export function Providers({ children }: { children: ReactNode }) {
  // One client per browser session; created lazily so SSR gets a fresh instance.
  const [queryClient] = useState(() => createQueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
