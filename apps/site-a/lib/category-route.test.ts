import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import {
  findCategoryBySlug,
  getCategoryStaticParams,
} from "./category-route";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("category route selection", () => {
  it("enumerates taxonomy slugs in release order", () => {
    const orderedBundle = structuredClone(bundle);
    const firstCategory = orderedBundle.taxonomy.categories[0];
    const firstArticle = orderedBundle.articles[0];
    if (!firstCategory || !firstArticle) {
      throw new Error("Site A fixture category or article is missing");
    }
    orderedBundle.taxonomy.categories.push({
      ...firstCategory,
      id: "digital",
      slug: "digital",
    });
    const articles = [
      ...orderedBundle.articles,
      { ...firstArticle, id: "ART-000124", categoryId: "digital" },
    ];

    expect(getCategoryStaticParams({ ...orderedBundle, articles })).toEqual([
      { category: "daily-admin" },
      { category: "digital" },
    ]);
  });

  it("looks up categories only by their exact slug", () => {
    const changedBundle = structuredClone(bundle);
    const category = changedBundle.taxonomy.categories[0];
    const article = changedBundle.articles[0];
    if (!category || !article) {
      throw new Error("Site A fixture category or article is missing");
    }
    category.id = "category-id";
    category.slug = "category-slug";
    article.categoryId = category.id;

    expect(findCategoryBySlug(changedBundle, "category-slug")).toBe(category);
    expect(findCategoryBySlug(changedBundle, "category-id")).toBeUndefined();
    expect(findCategoryBySlug(changedBundle, "Category-Slug")).toBeUndefined();
  });

  it("rejects every category without a published article", () => {
    const incompleteBundle = structuredClone(bundle);
    const firstCategory = incompleteBundle.taxonomy.categories[0];
    if (!firstCategory) {
      throw new Error("Site A fixture category is missing");
    }
    incompleteBundle.taxonomy.categories.push(
      { ...firstCategory, id: "empty-one", slug: "empty-one" },
      { ...firstCategory, id: "empty-two", slug: "empty-two" },
    );

    expect(() => getCategoryStaticParams(incompleteBundle)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          {
            path: "/taxonomy/categories/1/id",
            message: "category empty-one has no published articles",
          },
          {
            path: "/taxonomy/categories/2/id",
            message: "category empty-two has no published articles",
          },
        ],
      }),
    );
  });
});
