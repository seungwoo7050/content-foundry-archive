import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  readReleaseBundleDocuments,
  readReleaseBundleDocumentsForVersion,
} from "./read-bundle-documents.js";
import { validateContentReferences } from "./validate-content-references.js";

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
const reference = readReleaseBundleDocuments(fixture);
const referenceV3 = readReleaseBundleDocumentsForVersion("3.0.0", fixtureV3);

type ReferenceBundle = typeof reference | typeof referenceV3;

const expectInvalidPaths = (bundle: ReferenceBundle, paths: readonly string[]) => {
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

  it("accepts resolved gallery media while preserving the v3 bundle type", () => {
    const bundle = validateContentReferences(structuredClone(referenceV3));
    expectTypeOf(bundle).toEqualTypeOf<typeof referenceV3>();
    expect(bundle.release.contractVersion).toBe("3.0.0");
  });

  it("reports an unresolved gallery media item", () => {
    const bundle = structuredClone(referenceV3);
    const gallery = bundle.articles[0]!.content.find(
      (block) => block.type === "gallery",
    );
    if (!gallery) throw new TypeError("Expected gallery fixture block");
    gallery.items[1]!.mediaId = "MED-MISSING";

    expectInvalidPaths(bundle, ["/articles/0/content/2/items/1/mediaId"]);
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
