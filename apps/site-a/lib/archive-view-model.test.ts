import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
  type PublishedArticleProjection,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  getArchiveEntries,
  type ArchiveSource,
} from "./archive-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const referenceArticle = bundle.articles[0]!;

function article(
  id: string,
  publishedAt: string,
  canonicalPath: string,
): PublishedArticleProjection {
  return {
    ...structuredClone(referenceArticle),
    id,
    publishedAt,
    seo: { ...referenceArticle.seo, canonicalPath },
  };
}

describe("archive view model", () => {
  it("accepts and preserves the v3 release structure", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ArchiveSource>();
    getArchiveEntries({
      articles: [] as LoadedReleaseBundleV3["articles"],
      taxonomy: {
        categories: [] as LoadedReleaseBundleV3["taxonomy"]["categories"],
      },
    });
  });

  it("sorts published entries deterministically and resolves categories", () => {
    const articles = [
      article("ART-B", "2026-08-23T00:00:00Z", "/article/b"),
      article("ART-SAME", "2026-08-23T00:00:00Z", "/article/z"),
      article("ART-NEW", "2026-08-24T00:00:00Z", "/article/new"),
      article("ART-SAME", "2026-08-23T00:00:00Z", "/article/a"),
    ];

    const entries = getArchiveEntries({ ...bundle, articles });

    expect(entries.map(({ article: entry }) => entry.seo.canonicalPath)).toEqual([
      "/article/new",
      "/article/b",
      "/article/a",
      "/article/z",
    ]);
    expect(entries.every(({ category }) => category.label === "생활·행정")).toBe(true);
  });

  it("fails closed when an article category is unavailable", () => {
    expect(() =>
      getArchiveEntries({
        ...bundle,
        articles: [{ ...referenceArticle, categoryId: "missing-category" }],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [expect.objectContaining({ path: "/articles/0/categoryId" })],
      }),
    );
  });
});
