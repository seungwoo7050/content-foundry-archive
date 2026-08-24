import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  type ReleaseBundleDocumentsByVersion,
  readReleaseBundleDocuments,
  readReleaseBundleDocumentsForVersion,
} from "./read-bundle-documents.js";
import { validatePublicKeys } from "./validate-public-keys.js";

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

const expectInvalidAt = (bundle: typeof reference, path: string) => {
  expect(() => validatePublicKeys(bundle)).toThrowError(
    expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: expect.arrayContaining([expect.objectContaining({ path })]),
    }),
  );
};

describe("validatePublicKeys", () => {
  it("accepts unique keys in the reference bundle", () => {
    expect(validatePublicKeys(structuredClone(reference))).toBeDefined();
  });

  it("preserves a canonical v3 bundle type", () => {
    const bundle = validatePublicKeys(structuredClone(referenceV3));
    expectTypeOf(bundle).toEqualTypeOf<
      ReleaseBundleDocumentsByVersion["3.0.0"]
    >();
  });

  it("rejects a duplicate article slug", () => {
    const bundle = structuredClone(reference);
    const article = structuredClone(bundle.articles[0]!);
    article.id = "ART-000124";
    (bundle.articles as (typeof article)[]).push(article);

    expectInvalidAt(bundle, "/articles/1/slug");
  });

  it("rejects a duplicate category ID", () => {
    const bundle = structuredClone(reference);
    bundle.taxonomy.categories.push({
      id: "daily-admin",
      slug: "another-category",
      label: "duplicate",
      description: "duplicate category ID",
    });

    expectInvalidAt(bundle, "/taxonomy/categories/1/id");
  });

  it("rejects a duplicate media ID", () => {
    const bundle = structuredClone(reference);
    const media = {
      id: "hero",
      kind: "image" as const,
      source: "bundle" as const,
      path: "media/hero.png",
      sha256: "a".repeat(64),
      mimeType: "image/png",
      width: 1,
      height: 1,
      bytes: 1,
      alt: "hero",
      credit: null,
      license: null,
    };
    bundle.mediaManifest.items.push(media, structuredClone(media));

    expectInvalidAt(bundle, "/media/items/1/id");
  });
});
