import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createArticleBreadcrumbs,
  type ArticleBreadcrumbArticle,
  type ArticleBreadcrumbCategory,
  type ArticleBreadcrumbSite,
} from "./article-breadcrumbs";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("article breadcrumbs", () => {
  it("projects release-backed home, category, and current article facts", () => {
    expectTypeOf<LoadedReleaseBundle["site"]>().toExtend<ArticleBreadcrumbSite>();
    expectTypeOf<
      LoadedReleaseBundle["taxonomy"]["categories"][number]
    >().toExtend<ArticleBreadcrumbCategory>();
    expectTypeOf<LoadedReleaseBundle["articles"][number]>().toExtend<
      ArticleBreadcrumbArticle
    >();
    expectTypeOf<LoadedReleaseBundleV3["site"]>().toExtend<
      ArticleBreadcrumbSite
    >();
    expectTypeOf<
      LoadedReleaseBundleV3["taxonomy"]["categories"][number]
    >().toExtend<ArticleBreadcrumbCategory>();
    expectTypeOf<LoadedReleaseBundleV3["articles"][number]>().toExtend<
      ArticleBreadcrumbArticle
    >();

    const article = bundle.articles[0]!;
    const category = bundle.taxonomy.categories.find(
      ({ id }) => id === article.categoryId,
    )!;

    expect(createArticleBreadcrumbs(bundle.site, category, article)).toEqual([
      { label: "생활메모", path: "/", current: false },
      {
        label: "생활·행정",
        path: "/category/daily-admin",
        current: false,
      },
      {
        label: "정부24 주민등록등본 발급 방법",
        path: "/article/government24-resident-registration-guide",
        current: true,
      },
    ]);
  });
});
