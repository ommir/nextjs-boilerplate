import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    passWithNoTests: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Scoped to the modules Phase 2 of IMPLEMENTATION_PLAN.md targets (pure
      // logic, stores, one service, and the primitives/container with tests).
      // The rest of src/ (dashboard widgets, auth forms, Redux, other
      // primitives) is intentionally untested for now — see Phase 3 backlog.
      include: [
        "src/lib/utils.ts",
        "src/lib/breadcrumbs.ts",
        "src/features/auth/store/authStore.ts",
        "src/store/ui-store.ts",
        "src/features/product/services/productService.ts",
        "src/components/ui/Button.tsx",
        "src/components/ui/Badge.tsx",
        "src/components/ui/ProgressBar.tsx",
        "src/features/product/components/ProductList.tsx",
      ],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
