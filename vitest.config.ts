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
      // Scoped to the pure logic that unit tests can meaningfully cover:
      // mappers, schemas, stores, and the mock repository.
      //
      // Deliberately excluded: Server Actions, the Supabase repositories, and
      // the RLS policies. Those are exercised against a real Postgres — see
      // supabase/tests/*.test.sql — because mocking the database away would
      // test the mock rather than the authorization rules that matter.
      include: [
        "src/lib/utils.ts",
        "src/lib/breadcrumbs.ts",
        "src/config/env.ts",
        "src/store/ui-store.ts",
        "src/components/ui/Button.tsx",
        "src/components/ui/Badge.tsx",
        "src/components/ui/ProgressBar.tsx",
        "src/features/product/components/StockSignal.tsx",
        "src/features/product/mappers/productMapper.ts",
        "src/features/product/schemas/productSchemas.ts",
        "src/features/product/repositories/mockProductRepository.ts",
        "src/features/cart/store/cartStore.ts",
        "src/features/cart/components/CheckoutForm.tsx",
      ],
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 },
    },
  },
});
