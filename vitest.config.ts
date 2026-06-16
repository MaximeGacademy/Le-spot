import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // Vitest = tests unitaires sous src/. Les tests E2E (Playwright) vivent dans e2e/.
    include: ["src/**/*.test.ts"],
  },
});
