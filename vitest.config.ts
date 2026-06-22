import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./tests/shims/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    clearMocks: true,
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    restoreMocks: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      include: [
        "src/lib/admin/**/*.ts",
        "src/lib/auth/**/*.ts",
        "src/lib/careers/**/*.ts",
        "src/lib/public-data/**/*.ts",
        "src/lib/supabase/storage.ts",
      ],
    },
  },
});
