import { QueryClient } from "@tanstack/react-query";

/**
 * Factory for a configured React Query client. A factory (rather than a shared
 * singleton) prevents cross-request state bleed during SSR.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Serve cached data instantly, revalidate quietly (stale-while-revalidate).
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
