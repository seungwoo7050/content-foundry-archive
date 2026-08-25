const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { test } = require("node:test");

const pathVariables = [
  "QA_LIGHTHOUSE_STATIC_DIST_DIR",
  "QA_LIGHTHOUSE_OUTPUT_DIR",
];
const cleanEnvironment = { ...process.env };
for (const name of pathVariables) delete cleanEnvironment[name];

function loadConfig(environment = {}) {
  const output = execFileSync(
    process.execPath,
    ["--print", 'JSON.stringify(require("./lighthouserc.cjs"))'],
    { cwd: __dirname, encoding: "utf8", env: { ...cleanEnvironment, ...environment }, stdio: "pipe" },
  );
  return JSON.parse(output);
}

test("pins the approved three-run median Lighthouse thresholds", () => {
  const { ci } = loadConfig();
  assert.equal(ci.collect.numberOfRuns, 3);
  assert.equal(ci.assert.aggregationMethod, "median");
  assert.deepEqual(ci.assert.assertions, {
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
  });
});

test("collects the approved QA routes with an explicit mobile profile", () => {
  const { collect } = loadConfig().ci;
  assert.deepEqual(collect.url, [
    "http://localhost/",
    "http://localhost/article/qa-nonproduction-very-long-korean-title-layout-table-code-command-gallery-faq-source-update-related-action.html",
    "http://localhost/search.html",
  ]);
  assert.deepEqual(collect.settings, {
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
  });
});

test("accepts only exact absolute QA directory overrides", () => {
  const overridden = loadConfig({
    QA_LIGHTHOUSE_STATIC_DIST_DIR: "/private/tmp/qa-static",
    QA_LIGHTHOUSE_OUTPUT_DIR: "/private/tmp/qa-lighthouse",
  }).ci;
  assert.equal(overridden.collect.staticDistDir, "/private/tmp/qa-static");
  assert.equal(overridden.upload.outputDir, "/private/tmp/qa-lighthouse");
  assert.throws(
    () => loadConfig({ QA_LIGHTHOUSE_STATIC_DIST_DIR: "relative/site" }),
    /must be an exact absolute directory path/,
  );
  assert.throws(
    () => loadConfig({ QA_LIGHTHOUSE_OUTPUT_DIR: "" }),
    /must be an exact absolute directory path/,
  );
});
