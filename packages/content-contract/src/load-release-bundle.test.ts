import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  loadReleaseBundle,
  loadReleaseBundleForVersion,
} from "./load-release-bundle.js";
import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const fixtureV3 = fileURLToPath(
  new URL(
    "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);

describe("loadReleaseBundle", () => {
  it("loads a fully validated release", () => {
    const bundle = loadReleaseBundle(fixture, {
      expectedSiteId: "site-a",
      expectedReleaseId: "REL-2026-000042",
    });

    expect(bundle.articles[0]?.slug).toBe(
      "government24-resident-registration-guide",
    );
  });

  it("loads a fully validated v3 release only through the internal boundary", () => {
    const bundle = loadReleaseBundleForVersion("3.0.0", fixtureV3, {
      expectedSiteId: "site-a",
      expectedReleaseId: "REL-2026-000043",
    });

    expectTypeOf(bundle).toEqualTypeOf<
      ReleaseBundleDocumentsByVersion["3.0.0"]
    >();
    expect(bundle.mediaManifest.items).toHaveLength(2);
    expect(() => loadReleaseBundle(fixtureV3)).toThrowError(
      expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }),
    );
  });

  it("applies expected identity options to v3", () => {
    expect(() =>
      loadReleaseBundleForVersion("3.0.0", fixtureV3, {
        expectedSiteId: "site-b",
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/release/siteId" })],
      }),
    );
  });

  it("rejects an unexpected target site", () => {
    expect(() =>
      loadReleaseBundle(fixture, { expectedSiteId: "site-b" }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/release/siteId" })],
      }),
    );
  });

  it("rejects an unexpected release", () => {
    expect(() =>
      loadReleaseBundle(fixture, { expectedReleaseId: "REL-OTHER" }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/release/releaseId" })],
      }),
    );
  });
});
