const assert = require("node:assert/strict");
const { test } = require("node:test");

const { ci } = require("./lighthouserc.cjs");

test("pins the approved three-run median Lighthouse thresholds", () => {
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
