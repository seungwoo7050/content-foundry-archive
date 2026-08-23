import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { loadReleaseBundle } from "./load-release-bundle.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
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
