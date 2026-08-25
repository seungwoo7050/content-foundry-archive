import { defineConfig, devices } from "@playwright/test";

const defaultBaseURL = "http://127.0.0.1:4173";
const ci = process.env.CI === "true";

function resolveQualityBaseURL(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const match = /^http:\/\/(?:127\.0\.0\.1|localhost):([1-9]\d{0,4})$/.exec(
    value,
  );
  const port = Number(match?.[1]);

  if (match === null || port > 65_535) {
    throw new Error(
      "QUALITY_BASE_URL must be a bare loopback HTTP origin with an explicit port, for example http://127.0.0.1:4173.",
    );
  }

  return value;
}

const externalBaseURL = resolveQualityBaseURL(process.env.QUALITY_BASE_URL);
const baseURL = externalBaseURL ?? defaultBaseURL;

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
  ...(externalBaseURL === undefined
    ? {
        webServer: {
          command:
            "pnpm build && pnpm exec serve apps/site-a/out --config ../../../serve.json --listen tcp://127.0.0.1:4173 --no-clipboard",
          url: baseURL,
          reuseExistingServer: !ci,
          timeout: 120_000,
          stdout: "ignore" as const,
          stderr: "pipe" as const,
          gracefulShutdown: { signal: "SIGTERM" as const, timeout: 1_000 },
          env: { ...process.env, NO_UPDATE_CHECK: "1" },
        },
      }
    : {}),
});
