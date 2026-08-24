import { describe, expect, it } from "vitest";

import { validateBundleLayout } from "./validate-bundle-layout.js";

const requiredPaths = [
  "media/media-manifest.json",
  "navigation.json",
  "redirects.json",
  "site.json",
  "taxonomy.json",
] as const;

const expectIntegrityFailure = (paths: readonly string[], message: string) => {
  expect(() => validateBundleLayout(paths)).toThrowError(
    expect.objectContaining({ code: "INTEGRITY_FAILED", message }),
  );
};

describe("validateBundleLayout", () => {
  it("accepts required records without article, page, or media binaries", () => {
    expect(() => validateBundleLayout(requiredPaths)).not.toThrow();
  });

  it("accepts canonical article, page, and nested media payloads", () => {
    expect(() =>
      validateBundleLayout([
        ...requiredPaths,
        "articles/ART-000123.json",
        "articles/ART-GUIDE-2.json",
        "pages/about.json",
        "pages/privacy-policy.json",
        "media/MED-000045.webp",
        "media/source/screens/MED-000046.png",
      ]),
    ).not.toThrow();
  });

  it.each(requiredPaths)("rejects a missing required payload %s", (missing) => {
    expectIntegrityFailure(
      requiredPaths.filter((path) => path !== missing),
      `Missing required bundle path: ${missing}`,
    );
  });

  it.each([
    "search-index.json",
    "unexpected.json",
    "articles/nested/ART-000123.json",
    "articles/article.json",
    "articles/ART-000123.txt",
    "pages/nested/about.json",
    "pages/About.json",
    "pages/about.txt",
  ])("rejects a noncanonical payload %s", (path) => {
    expectIntegrityFailure(
      [...requiredPaths, path],
      `Noncanonical bundle path: ${path}`,
    );
  });
});
