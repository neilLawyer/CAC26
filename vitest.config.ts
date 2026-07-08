import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests (tests/unit/**) — pure logic only: the eligibility engine, the
// cliff arithmetic, the .ics builder. Browser behavior stays in Playwright
// (tests/e2e/**), which has its own runner and must not be picked up here.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
  },
});
