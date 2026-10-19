import { defineConfig, devices } from "@playwright/test";

/** Smoke-tests every story in the built Storybook. Run with `pnpm test:stories`. */
export default defineConfig({
  testDir: "./tests/storybook",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: "http://localhost:6006" },
  projects: [{ name: "storybook", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "pnpm build-storybook --disable-telemetry --loglevel=warn && node scripts/serve-static.mjs storybook-static 6006",
    url: "http://localhost:6006/index.json",
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
