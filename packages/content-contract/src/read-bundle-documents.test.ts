import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { readReleaseBundleDocuments } from "./read-bundle-documents.js";

const fixture = fileURLToPath(
  new URL(
    "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
    import.meta.url,
  ),
);

describe("readReleaseBundleDocuments", () => {
  it("validates and reads every canonical record group", () => {
    const bundle = readReleaseBundleDocuments(fixture);

    expect(bundle.release.releaseId).toBe("REL-2026-000042");
    expect(bundle.site.id).toBe("site-a");
    expect(bundle.navigation.items).toHaveLength(2);
    expect(bundle.taxonomy.categories).toHaveLength(1);
    expect(bundle.mediaManifest.items).toEqual([]);
    expect(bundle.redirects.items).toEqual([]);
    expect(bundle.articles.map(({ id }) => id)).toEqual(["ART-000123"]);
    expect(bundle.pages.map(({ id }) => id)).toEqual(["about"]);
  });
});
