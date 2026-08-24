import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadReleaseBundleForVersion } from "./load-release-bundle.js";
import { validateV4ReleaseConsumerContext } from "./validate-v4-release-consumer-context.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/4.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const loadFixture = () => loadReleaseBundleForVersion("4.0.0", fixture);
const context = () => ({
  generatedRoutes: new Set([
    "/about",
    "/article/government24-resident-registration-guide",
  ]),
  nicheComponentRegistry: { "site-a": [] },
  presentationReadiness: {
    releaseMode: "template" as const,
    siteWideNoindex: true,
  },
});

describe("v4 release consumer context", () => {
  it("composes route, niche, and presentation readiness checks", () => {
    expect(validateV4ReleaseConsumerContext(loadFixture(), context())).toBeDefined();
  });

  it("retains the structured-content route validation", () => {
    const incomplete = context();
    incomplete.generatedRoutes.delete("/about");
    expect(() =>
      validateV4ReleaseConsumerContext(loadFixture(), incomplete),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/articles/0/content/3/path" })],
      }),
    );
  });

  it("applies v4 presentation readiness after shared consumer checks", () => {
    const indexable = context();
    indexable.presentationReadiness.siteWideNoindex = false;
    expect(() =>
      validateV4ReleaseConsumerContext(loadFixture(), indexable),
    ).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [
          expect.objectContaining({
            path: "/validationContext/siteWideNoindex",
          }),
        ],
      }),
    );
  });
});
