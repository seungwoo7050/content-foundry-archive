import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readReleaseBundleDocuments } from "./read-bundle-documents.js";
import { validateContentReferences } from "./validate-content-references.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);
const reference = readReleaseBundleDocuments(fixture);

const expectInvalidPaths = (bundle: typeof reference, paths: readonly string[]) => {
  expect(() => validateContentReferences(bundle)).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: expect.arrayContaining(
        paths.map((path) => expect.objectContaining({ path })),
      ),
    }),
  );
};

describe("validateContentReferences", () => {
  it("accepts resolved references in the reference bundle", () => {
    expect(validateContentReferences(structuredClone(reference))).toBeDefined();
  });

  it("reports missing category and tag records", () => {
    const bundle = structuredClone(reference);
    const article = bundle.articles[0]!;
    article.categoryId = "missing-category";
    article.tagIds.push("missing-tag");

    expectInvalidPaths(bundle, ["/articles/0/categoryId", "/articles/0/tagIds/1"]);
  });

  it("reports a missing related article", () => {
    const bundle = structuredClone(reference);
    bundle.articles[0]!.relatedArticleIds.push("ART-999999");

    expectInvalidPaths(bundle, ["/articles/0/relatedArticleIds/0"]);
  });

  it("reports unresolved hero and content media", () => {
    const bundle = structuredClone(reference);
    const article = bundle.articles[0]!;
    article.heroMediaId = "missing-hero";
    article.content.push({ type: "image", mediaId: "missing-image" });
    bundle.pages[0]!.content.push({ type: "image", mediaId: "missing-page-image" });

    expectInvalidPaths(bundle, [
      "/articles/0/heroMediaId",
      "/articles/0/content/2/mediaId",
      "/pages/0/content/1/mediaId",
    ]);
  });
});
