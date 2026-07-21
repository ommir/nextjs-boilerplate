"use client";

import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./store";

/**
 * Optional Redux provider. Not mounted by default — wrap a subtree (or the root
 * `Providers`) with it only when you actually adopt Redux:
 *
 * ```tsx
 * // src/app/providers.tsx
 * import { ReduxProvider } from "@/store/redux/ReduxProvider";
 * return <ReduxProvider><QueryClientProvider ...>{children}</QueryClientProvider></ReduxProvider>;
 * ```
 */
export function ReduxProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  storeRef.current ??= makeStore();
  return <Provider store={storeRef.current}>{children}</Provider>;
}
