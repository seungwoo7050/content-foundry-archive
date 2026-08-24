import { fileURLToPath } from "node:url";

import { describe, expect, expectTypeOf, it } from "vitest";

import {
  type ReleaseBundleDocumentsByVersion,
  readReleaseBundleDocuments,
  readReleaseBundleDocumentsForVersion,
  readSupportedReleaseBundleDocuments,
} from "./read-bundle-documents.js";

const fixture = (version: "2.0.0" | "3.0.0" | "4.0.0") =>
  fileURLToPath(
    new URL(
      `../vendor/${version}/fixtures/bundles/valid/site-a-minimal/`,
      import.meta.url,
    ),
  );

describe("readReleaseBundleDocuments", () => {
  it("validates and reads every canonical record group", () => {
    const root = fixture("2.0.0");
    const bundle = readReleaseBundleDocuments(root);

    expect(bundle.release.contractVersion).toBe("2.0.0");
    expect(readReleaseBundleDocumentsForVersion("2.0.0", root)).toEqual(bundle);
    expect(bundle.release.releaseId).toBe("REL-2026-000042");
    expect(bundle.site.id).toBe("site-a");
    expect(bundle.navigation.items).toHaveLength(2);
    expect(bundle.taxonomy.categories).toHaveLength(1);
    expect(bundle.mediaManifest.items).toEqual([]);
    expect(bundle.redirects.items).toEqual([]);
    expect(bundle.articles.map(({ id }) => id)).toEqual(["ART-000123"]);
    expect(bundle.pages.map(({ id }) => id)).toEqual(["about"]);
  });

  it("reads every canonical v3 root through the internal version boundary", () => {
    const bundle = readReleaseBundleDocumentsForVersion(
      "3.0.0",
      fixture("3.0.0"),
    );

    expectTypeOf(bundle).toEqualTypeOf<ReleaseBundleDocumentsByVersion["3.0.0"]>();
    expect(bundle.release.releaseId).toBe("REL-2026-000043");
    expect(bundle.site.id).toBe("site-a");
    expect(bundle.navigation.items).toHaveLength(2);
    expect(bundle.taxonomy.categories).toHaveLength(1);
    expect(bundle.mediaManifest.items).toHaveLength(2);
    expect(bundle.redirects.items).toEqual([]);
    const articleBlockTypes = bundle.articles[0]?.content.map(({ type }) => type);
    expect(articleBlockTypes).toEqual(["heading", "paragraph", "gallery", "action-link"]);
    expect(bundle.pages[0]?.content.at(-1)?.type).toBe("action-link");
  });

  it("requires and reads the canonical v4 presentation root", () => {
    const bundle = readReleaseBundleDocumentsForVersion(
      "4.0.0",
      fixture("4.0.0"),
    );

    expectTypeOf(bundle).toEqualTypeOf<ReleaseBundleDocumentsByVersion["4.0.0"]>();
    expect(bundle.release.releaseId).toBe("REL-2026-000044");
    expect(bundle.presentation.home.featuredArticleIds).toEqual(["ART-000123"]);
    expect(bundle.presentation.categoryHighlights).toEqual([
      { categoryId: "daily-admin", articleIds: ["ART-000123"] },
    ]);
    expect(bundle.presentation.brand).toEqual({
      logoMediaId: null,
      faviconMediaId: null,
      socialImageMediaId: null,
    });
  });

  it("keeps canonical v3 unavailable through the legacy reader", () => {
    expect(() => readReleaseBundleDocuments(fixture("3.0.0"))).toThrowError(
      expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }),
    );
  });

  it("assembles every supported release document version", () => {
    expect(
      readSupportedReleaseBundleDocuments(fixture("2.0.0")).release
        .contractVersion,
    ).toBe("2.0.0");
    expect(
      readSupportedReleaseBundleDocuments(fixture("3.0.0")).release
        .contractVersion,
    ).toBe("3.0.0");
  });
});
