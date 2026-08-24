import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  findCategoryBySlug,
  getCategoryAdditionalPageStaticParams,
  getCategoryPageStaticParams,
  getCategoryStaticParams,
  resolveCategoryAdditionalPage,
  type CategoryRouteSource,
} from "./category-route";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("category route selection", () => {
  it("accepts and preserves v3 category route records", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<CategoryRouteSource>();
    const category = findCategoryBySlug(
      {
        articles: [] as LoadedReleaseBundleV3["articles"],
        taxonomy: { categories: [] as LoadedReleaseBundleV3["taxonomy"]["categories"] },
      },
      "missing",
    );
    expectTypeOf(category).toEqualTypeOf<
      LoadedReleaseBundleV3["taxonomy"]["categories"][number] | undefined
    >();
  });

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

  it("adds retired category slugs to the static page set", () => {
    expect(
      getCategoryPageStaticParams({
        articles: [{ categoryId: "current" }],
        taxonomy: { categories: [{ id: "current", slug: "current" }] },
        redirects: {
          items: [
            {
              type: "gone",
              path: "/category/retired",
              status: 410,
              replacementPath: "/category/current",
            },
          ],
        },
      }),
    ).toEqual([{ category: "current" }, { category: "retired" }]);
  });

  it("enumerates only page-two-and-later category routes", () => {
    const articles = Array.from({ length: 25 }, (_, index) => ({
      categoryId: index < 13 ? "guides" : "news",
    }));

    expect(getCategoryAdditionalPageStaticParams({
      articles,
      taxonomy: {
        categories: [
          { id: "guides", slug: "guides" },
          { id: "news", slug: "news" },
        ],
      },
    })).toEqual([{ category: "guides", page: "2" }]);
  });

  it("resolves only exact category slugs and canonical in-range page values", () => {
    const source = {
      articles: Array.from({ length: 13 }, () => ({ categoryId: "guides" })),
      taxonomy: { categories: [{ id: "guides", slug: "daily-guides" }] },
    };

    expect(resolveCategoryAdditionalPage(source, "daily-guides", "2")).toEqual({
      category: source.taxonomy.categories[0],
      page: 2,
    });
    expect(resolveCategoryAdditionalPage(source, "guides", "2")).toBeNull();
    expect(resolveCategoryAdditionalPage(source, "daily-guides", "1")).toBeNull();
    expect(resolveCategoryAdditionalPage(source, "daily-guides", "02")).toBeNull();
    expect(resolveCategoryAdditionalPage(source, "daily-guides", "3")).toBeNull();
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
    expect(() =>
      resolveCategoryAdditionalPage(incompleteBundle, "daily-admin", "2")
    ).toThrowError(expect.objectContaining({ code: "REFERENCE_INVALID" }));
  });
});
