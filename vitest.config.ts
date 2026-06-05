import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Vitest = tests unitaires sous src/. Les tests E2E (Playwright) vivent dans e2e/.
    include: ["src/**/*.test.ts"],
  },
});
