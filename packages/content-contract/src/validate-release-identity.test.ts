import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readReleaseBundleDocuments } from "./read-bundle-documents.js";
import { validateReleaseIdentity } from "./validate-release-identity.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocuments(fixture);

describe("validateReleaseIdentity", () => {
  it("accepts matching release identity and counts", () => {
    expect(validateReleaseIdentity(structuredClone(reference))).toBeDefined();
  });

  it("rejects a site identity mismatch", () => {
    const bundle = structuredClone(reference);
    bundle.site.id = "site-b";

    expect(() => validateReleaseIdentity(bundle)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/site/id" })],
      }),
    );
  });

  it("reports theme, skin, and count mismatches together", () => {
    const bundle = structuredClone(reference);
    bundle.site.defaultTheme = "editorial-utility";
    bundle.site.defaultSkin = "other-skin";
    bundle.release.articleCount = 2;

    expect(() => validateReleaseIdentity(bundle)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: expect.arrayContaining([
          expect.objectContaining({ path: "/site/defaultTheme" }),
          expect.objectContaining({ path: "/site/defaultSkin" }),
          expect.objectContaining({ path: "/release/articleCount" }),
        ]),
      }),
    );
  });
});
