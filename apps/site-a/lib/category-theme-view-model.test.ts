import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { CategoryRouteViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createCategoryThemeViewModel,
  type CategoryThemeSource,
} from "./category-theme-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const category = bundle.taxonomy.categories[0]!;

describe("category theme view model", () => {
  it("accepts v3 and returns the closed category route contract", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<CategoryThemeSource>();
    expectTypeOf<ReturnType<typeof createCategoryThemeViewModel>>().toEqualTypeOf<
      CategoryRouteViewModel
    >();
  });

  it("projects resolved category, recent articles, and actual topics", () => {
    const model = createCategoryThemeViewModel(bundle, category);

    expect(model).toMatchObject({
      kind: "category",
      path: "/category/daily-admin",
      heading: "생활·행정",
      description: "생활과 행정 절차 안내",
      breadcrumbs: [
        { href: "/", label: "생활메모" },
        { href: "/category/daily-admin", label: "생활·행정" },
      ],
      articleSectionHeading: "최근 안내",
      topicSectionHeading: "관련 주제",
      topics: ["정부24"],
    });
    expect(model.articles[0]?.link.href).toBe(
      "/article/government24-resident-registration-guide",
    );
    expect(model).not.toHaveProperty("featuredArticles");
  });

  it("omits an empty topic section honestly", () => {
    const model = createCategoryThemeViewModel(
      { ...bundle, articles: [], taxonomy: { ...bundle.taxonomy, tags: [] } },
      category,
    );

    expect(model.articles).toEqual([]);
    expect(model.topics).toEqual([]);
    expect(model.topicSectionHeading).toBeNull();
  });
});
