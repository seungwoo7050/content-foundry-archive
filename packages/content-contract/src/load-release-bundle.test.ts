import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  loadReleaseBundle,
  loadReleaseBundleForVersion,
  validateV3ReleaseBundle,
  validateV4ReleaseBundle,
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
const fixtureV4 = fileURLToPath(
  new URL(
    "../vendor/4.0.0/fixtures/bundles/valid/site-a-minimal/",
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

  it("loads the exact v4 release with its required presentation", () => {
    const bundle = loadReleaseBundleForVersion("4.0.0", fixtureV4, {
      expectedSiteId: "site-a",
      expectedReleaseId: "REL-2026-000044",
    });

    expectTypeOf(bundle).toEqualTypeOf<
      ReleaseBundleDocumentsByVersion["4.0.0"]
    >();
    expect(bundle.release.contractVersion).toBe("4.0.0");
    expect(bundle.presentation.home.featuredArticleIds).toEqual(["ART-000123"]);
  });

  it("composes v4 presentation structure before reference validation", () => {
    const bundle = loadReleaseBundleForVersion("4.0.0", fixtureV4);
    bundle.presentation.home.currentArticleIds = ["ART-000123"];
    bundle.presentation.home.evergreenArticleIds = ["ART-MISSING"];

    expect(() => validateV4ReleaseBundle(bundle)).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [
          expect.objectContaining({
            path: "/presentation/home/currentArticleIds/0",
          }),
        ],
      }),
    );
  });

  it("composes v4 presentation reference validation", () => {
    const bundle = loadReleaseBundleForVersion("4.0.0", fixtureV4);
    bundle.presentation.brand.faviconMediaId = "MED-MISSING";

    expect(() => validateV4ReleaseBundle(bundle)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          expect.objectContaining({ path: "/presentation/brand/faviconMediaId" }),
        ],
      }),
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

  it("composes gallery alt validation into the v3 loader", () => {
    const bundle = loadReleaseBundleForVersion("3.0.0", fixtureV3);
    bundle.mediaManifest.items[0]!.alt = "   ";

    expect(() => validateV3ReleaseBundle(bundle)).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [expect.objectContaining({ path: "/media/items/0/alt" })],
      }),
    );
  });

  it("composes external action validation into the v3 loader", () => {
    const bundle = loadReleaseBundleForVersion("3.0.0", fixtureV3);
    bundle.articles[0]!.content[3] = {
      type: "action-link",
      kind: "official",
      label: "소개 읽기",
      url: "https://example.com/about",
    };

    expect(() => validateV3ReleaseBundle(bundle)).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [expect.objectContaining({ path: "/articles/0/content/3/url" })],
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
