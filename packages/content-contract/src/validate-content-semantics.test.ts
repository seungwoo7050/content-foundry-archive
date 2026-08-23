import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readReleaseBundleDocuments } from "./read-bundle-documents.js";
import { validateContentSemantics } from "./validate-content-semantics.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocuments(fixture);

const expectInvalidPaths = (bundle: typeof reference, paths: readonly string[]) => {
  expect(() => validateContentSemantics(bundle)).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: expect.arrayContaining(
        paths.map((path) => expect.objectContaining({ path })),
      ),
    }),
  );
};

describe("validateContentSemantics", () => {
  it("accepts the reference bundle semantics", () => {
    expect(validateContentSemantics(structuredClone(reference))).toBeDefined();
  });

  it("rejects an update before publication", () => {
    const bundle = structuredClone(reference);
    bundle.articles[0]!.updatedAt = "2026-08-19T23:59:59Z";

    expectInvalidPaths(bundle, ["/articles/0/updatedAt"]);
  });

  it("rejects article and page canonical mismatches", () => {
    const bundle = structuredClone(reference);
    bundle.articles[0]!.seo.canonicalPath = "/wrong-article";
    bundle.pages[0]!.seo.canonicalPath = "/wrong-page";

    expectInvalidPaths(bundle, [
      "/articles/0/seo/canonicalPath",
      "/pages/0/seo/canonicalPath",
    ]);
  });

});
