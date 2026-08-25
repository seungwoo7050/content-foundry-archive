const { chromium } = require("@playwright/test");

module.exports = {
  ci: {
    collect: {
      chromePath: chromium.executablePath(),
      staticDistDir: "./apps/site-a/out",
      url: [
        "http://localhost/",
        "http://localhost/article/government24-resident-registration-guide.html",
        "http://localhost/search.html",
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-gpu",
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
      outputDir: "./output/lighthouse",
    },
  },
};
