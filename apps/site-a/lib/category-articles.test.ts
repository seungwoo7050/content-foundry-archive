import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type PublishedArticleProjection,
} from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { getCategoryArticles } from "./category-articles";

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
});
