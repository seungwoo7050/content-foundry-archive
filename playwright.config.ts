import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";
const ci = process.env.CI === "true";

export default defineConfig({
  testDir: "./apps/site-a/e2e",
  outputDir: "./output/playwright/test-results",
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  failOnFlakyTests: ci,
  workers: ci ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    [ci ? "line" : "list"],
    ["html", { open: "never", outputFolder: "./output/playwright/report" }],
  ],
  use: {
    baseURL,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    colorScheme: "light",
    reducedMotion: "reduce",
    serviceWorkers: "block",
    actionTimeout: 5_000,
    navigationTimeout: 15_000,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1_440, height: 1_000 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: "chromium-reflow",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 320, height: 800 },
      },
    },
    {
      name: "chromium-javascript-off",
      use: {
        ...devices["Desktop Chrome"],
        javaScriptEnabled: false,
        viewport: { width: 1_440, height: 1_000 },
      },
    },
    {
      name: "firefox-desktop",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1_440, height: 1_000 },
      },
    },
    {
      name: "webkit-mobile",
      use: {
        ...devices["iPhone 13"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command:
      "pnpm build && pnpm exec serve apps/site-a/out --config ../../../serve.json --listen tcp://127.0.0.1:4173 --no-clipboard",
    url: baseURL,
    reuseExistingServer: !ci,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
    gracefulShutdown: { signal: "SIGTERM", timeout: 1_000 },
    env: { ...process.env, NO_UPDATE_CHECK: "1" },
  },
});
