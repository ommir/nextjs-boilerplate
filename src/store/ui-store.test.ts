import { beforeEach, describe, expect, it } from "vitest";
import { useUiStore } from "./ui-store";

// Snapshot the store's initial state (including actions) before any test mutates it,
// so it can be restored wholesale between tests without losing the setters.
const initialState = useUiStore.getState();

describe("useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState(initialState, true);
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("toggles the sidebar open state", () => {
    expect(useUiStore.getState().sidebarOpen).toBe(false);

    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);

    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it("sets the sidebar open state explicitly", () => {
    useUiStore.getState().setSidebarOpen(true);
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  it("sets the theme and writes it to the document's data-theme attribute", () => {
    useUiStore.getState().setTheme("dark");

    expect(useUiStore.getState().theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("sets the time range", () => {
    useUiStore.getState().setTimeRange("quarter");
    expect(useUiStore.getState().timeRange).toBe("quarter");
  });
});
