import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import { loadReleaseBundleForVersion } from "./load-release-bundle.js";
import {
  type LoadedReleaseBundleV3,
  validateV3ReleaseConsumerContext,
} from "./validate-v3-release-consumer-context.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const generatedRoutes = new Set([
  "/about",
  "/article/government24-resident-registration-guide",
]);

function loadReference() {
  return loadReleaseBundleForVersion("3.0.0", fixture);
}

describe("validateV3ReleaseConsumerContext", () => {
  it("accepts canonical action routes with an empty niche registry", () => {
    const bundle = loadReference();
    const validated = validateV3ReleaseConsumerContext(bundle, {
      generatedRoutes,
      nicheComponentRegistry: {},
    });

    expect(validated).toBe(bundle);
    expectTypeOf(validated).toEqualTypeOf<LoadedReleaseBundleV3>();
  });

  it("rejects an internal action omitted from generated routes", () => {
    expect(() =>
      validateV3ReleaseConsumerContext(loadReference(), {
        generatedRoutes: new Set([
          "/article/government24-resident-registration-guide",
        ]),
        nicheComponentRegistry: {},
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/articles/0/content/3/path" })],
      }),
    );
  });

  it("rejects a niche component registered only for another site", () => {
    const bundle = loadReference();
    bundle.pages[0]!.content.push({
      type: "niche-component",
      componentId: "date-gap-calculator",
      label: "두 날짜 사이 일수 계산기",
      fallbackText: "본문 기준에 따라 날짜 수를 세세요.",
    });

    expect(() =>
      validateV3ReleaseConsumerContext(bundle, {
        generatedRoutes,
        nicheComponentRegistry: {
          "site-b": ["date-gap-calculator"],
        },
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/pages/0/content/2/componentId" })],
      }),
    );
  });
});
