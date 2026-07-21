import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";
export type TimeRange = "week" | "next-week" | "month" | "quarter";

interface UiState {
  sidebarOpen: boolean;
  theme: ThemeMode;
  timeRange: TimeRange;
}

interface UiActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setTimeRange: (range: TimeRange) => void;
}

/**
 * App-wide UI store — a second Zustand store, separate from auth, showing
 * feature-oriented store modularization. Persists durable UI preferences only.
 */
export const useUiStore = create<UiState & UiActions>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: "light",
      timeRange: "month",

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.dataset.theme = theme;
        }
        set({ theme });
      },
      setTimeRange: (timeRange) => set({ timeRange }),
    }),
    {
      name: "studio-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme, timeRange: state.timeRange }),
    },
  ),
);
