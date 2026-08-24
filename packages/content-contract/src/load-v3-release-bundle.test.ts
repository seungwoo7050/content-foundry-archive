import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it, vi } from "vitest";

import {
  loadV3ReleaseBundle,
  type LoadedReleaseBundleV3,
} from "./index.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const canonicalRoutes = new Set([
  "/about",
  "/article/government24-resident-registration-guide",
]);

describe("loadV3ReleaseBundle", () => {
  it("requires and applies consumer context to the core-valid bundle", () => {
    const resolveConsumerContext = vi.fn((bundle: LoadedReleaseBundleV3) => ({
      generatedRoutes: canonicalRoutes,
      nicheComponentRegistry: { [bundle.release.siteId]: [] },
    }));

    const bundle = loadV3ReleaseBundle(fixture, { resolveConsumerContext });

    expectTypeOf(bundle).toEqualTypeOf<LoadedReleaseBundleV3>();
    expect(bundle.release.contractVersion).toBe("3.0.0");
    expect(resolveConsumerContext).toHaveBeenCalledOnce();
    expect(resolveConsumerContext).toHaveBeenCalledWith(bundle);
  });

  it("rejects a consumer context missing an internal action target", () => {
    expect(() =>
      loadV3ReleaseBundle(fixture, {
        resolveConsumerContext: () => ({
          generatedRoutes: new Set([
            "/article/government24-resident-registration-guide",
          ]),
          nicheComponentRegistry: { "site-a": [] },
        }),
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/articles/0/content/3/path" })],
      }),
    );
  });

  it("preserves expected release identity checks", () => {
    expect(() =>
      loadV3ReleaseBundle(fixture, {
        expectedSiteId: "site-b",
        resolveConsumerContext: () => ({
          generatedRoutes: canonicalRoutes,
          nicheComponentRegistry: {},
        }),
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/release/siteId" })],
      }),
    );
  });
});
