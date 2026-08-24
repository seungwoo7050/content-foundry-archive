import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
  type PublishedArticleProjection,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  getCategoryArticles,
  getCategoryTags,
  type CategoryArticleSource,
  type CategoryTagSource,
} from "./category-articles";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

function getFixtureArticle() {
  const article = bundle.articles[0];
  if (!article) {
    throw new Error("Site A fixture article is missing");
  }
  return article;
}

function createArticle(
  id: string,
  categoryId: string,
  updatedAt: string,
): PublishedArticleProjection {
  return {
    ...structuredClone(getFixtureArticle()),
    id,
    categoryId,
    updatedAt,
  };
}

describe("category article selection", () => {
  it("accepts and preserves v3 article and tag records", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<CategoryArticleSource>();
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<CategoryTagSource>();
    const articles = getCategoryArticles(
      { articles: [] as LoadedReleaseBundleV3["articles"] },
      "category",
    );
    const tags = getCategoryTags(
      { taxonomy: { tags: [] as LoadedReleaseBundleV3["taxonomy"]["tags"] } },
      articles,
    );
    expectTypeOf(articles).toEqualTypeOf<
      Array<LoadedReleaseBundleV3["articles"][number]>
    >();
    expectTypeOf(tags).toEqualTypeOf<
      Array<LoadedReleaseBundleV3["taxonomy"]["tags"][number]>
    >();
  });

  it("filters by exact category ID and returns a deterministic recent-first copy", () => {
    const input = [
      createArticle("ART-000101", "category-id", "2026-08-23T01:00:00Z"),
      createArticle("ART-000001", "daily-admin", "2026-08-25T01:00:00Z"),
      createArticle("ART-000300", "category-id", "2026-08-24T01:00:00Z"),
      createArticle("ART-000100", "category-id", "2026-08-23T01:00:00Z"),
    ];
    const selectionBundle = { ...bundle, articles: input };
    const originalOrder = [...input];

    const selected = getCategoryArticles(selectionBundle, "category-id");

    expect(selected.map(({ id }) => id)).toEqual([
      "ART-000300",
      "ART-000100",
      "ART-000101",
    ]);
    expect(selectionBundle.articles).toEqual(originalOrder);
    expect(selected).not.toBe(selectionBundle.articles);
  });

  it("projects referenced tags in taxonomy order without duplicates", () => {
    const existingTag = bundle.taxonomy.tags[0];
    if (!existingTag) {
      throw new Error("Site A fixture tag is missing");
    }
    const tags = [
      existingTag,
      { ...existingTag, id: "digital", slug: "digital" },
      { ...existingTag, id: "unused", slug: "unused" },
    ];
    const articles = [
      {
        ...getFixtureArticle(),
        id: "ART-000201",
        tagIds: ["digital", existingTag.id],
      },
      {
        ...getFixtureArticle(),
        id: "ART-000202",
        tagIds: [existingTag.id],
      },
    ];
    const selectionBundle = {
      ...bundle,
      taxonomy: { ...bundle.taxonomy, tags },
    };

    expect(getCategoryTags(selectionBundle, articles).map(({ id }) => id)).toEqual([
      existingTag.id,
      "digital",
    ]);
  });
});
