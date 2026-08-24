import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  type ReleaseBundleDocumentsByVersion,
  readReleaseBundleDocuments,
  readReleaseBundleDocumentsForVersion,
} from "./read-bundle-documents.js";
import { validateContentSemantics } from "./validate-content-semantics.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocuments(fixture);
const referenceV3 = readReleaseBundleDocumentsForVersion(
  "3.0.0",
  fileURLToPath(
    new URL(
      "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
      import.meta.url,
    ),
  ),
);

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

  it("preserves canonical v3 semantics and rejects a v3 canonical mismatch", () => {
    const bundle = validateContentSemantics(structuredClone(referenceV3));
    expectTypeOf(bundle).toEqualTypeOf<
      ReleaseBundleDocumentsByVersion["3.0.0"]
    >();

    bundle.pages[0]!.seo.canonicalPath = "/wrong-page";
    expect(() => validateContentSemantics(bundle)).toThrowError(
      expect.objectContaining({
        issues: [expect.objectContaining({ path: "/pages/0/seo/canonicalPath" })],
      }),
    );
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

  it("rejects duplicate or inconsistent heading anchors", () => {
    const bundle = structuredClone(reference);
    const article = bundle.articles[0]!;
    article.content.push({ type: "heading", id: "prepare", level: 3, text: "Again" });
    article.toc[0]!.text = "Wrong text";
    article.toc.push({ id: "missing", level: 2, text: "Missing" });

    expectInvalidPaths(bundle, [
      "/articles/0/content/2/id",
      "/articles/0/toc/0",
      "/articles/0/toc/1/id",
    ]);
  });
});
