import { defineConfig, devices } from "@playwright/test";

// The correctness gate: every interactive control gets CLICKED in a real
// browser and must land where it claims. Run `npm run build` first — the
// suite drives the production server for deterministic behavior.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // 4 workers + 1 retry: with 12 parallel workers hammering one next server,
  // clicks can race hydration (a nondeterministic test-env artifact — every
  // control passes serially). A retry can't mask a REAL dead control, since
  // a dead link fails deterministically on every attempt.
  workers: 4,
  retries: 1,
  reporter: [["list"]],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm start",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
