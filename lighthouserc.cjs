const { chromium } = require("@playwright/test");
const { isAbsolute } = require("node:path");

const directorySetting = (name, fallback) => {
  const value = process.env[name];
  if (value === undefined) return fallback;
  if (value.length === 0 || value !== value.trim() || !isAbsolute(value)) {
    throw new Error(`${name} must be an exact absolute directory path`);
  }
  return value;
};

module.exports = {
  ci: {
    collect: {
      chromePath: chromium.executablePath(),
      staticDistDir: directorySetting(
        "QA_LIGHTHOUSE_STATIC_DIST_DIR",
        "./apps/site-a/out",
      ),
      url: [
        "http://localhost/",
        "http://localhost/article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action.html",
        "http://localhost/search.html",
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-gpu",
        formFactor: "mobile",
        throttlingMethod: "simulate",
        throttling: {
          rttMs: 150,
          throughputKbps: 1_638.4,
          requestLatencyMs: 562.5,
          downloadThroughputKbps: 1_474.56,
          uploadThroughputKbps: 675,
          cpuSlowdownMultiplier: 4,
        },
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 1.75,
          disabled: false,
        },
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "first-contentful-paint": ["error", { maxNumericValue: 1_800 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2_500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        interactive: ["error", { maxNumericValue: 3_500 }],
        "resource-summary:script:size": ["error", { maxNumericValue: 204_800 }],
        "resource-summary:stylesheet:size": ["error", { maxNumericValue: 24_576 }],
        "resource-summary:font:size": ["error", { maxNumericValue: 122_880 }],
        "resource-summary:image:size": ["error", { maxNumericValue: 512_000 }],
        "resource-summary:third-party:count": ["error", { maxNumericValue: 0 }],
      },
      aggregationMethod: "median",
    },
    upload: {
      target: "filesystem",
      outputDir: directorySetting(
        "QA_LIGHTHOUSE_OUTPUT_DIR",
        "./output/lighthouse",
      ),
    },
  },
};
