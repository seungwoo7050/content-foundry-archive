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
    if (!firstCategory) {
      throw new Error("Site A fixture category is missing");
    }
    orderedBundle.taxonomy.categories.push({
      ...firstCategory,
      id: "digital",
      slug: "digital",
    });

    expect(getCategoryStaticParams(orderedBundle)).toEqual([
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
});
