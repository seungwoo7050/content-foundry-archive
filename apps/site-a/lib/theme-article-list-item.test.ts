import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { ArticleListItemViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createThemeArticleListItem,
  type ThemeArticleListRecord,
  type ThemeArticleListSource,
} from "./theme-article-list-item";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const article = bundle.articles[0]!;

describe("theme article list item", () => {
  it("accepts both supported release structures", () => {
    expectTypeOf<LoadedReleaseBundle>().toExtend<ThemeArticleListSource>();
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ThemeArticleListSource>();
    expectTypeOf<LoadedReleaseBundle["articles"][number]>().toExtend<ThemeArticleListRecord>();
    expectTypeOf<LoadedReleaseBundleV3["articles"][number]>().toExtend<ThemeArticleListRecord>();
    expectTypeOf<ReturnType<typeof createThemeArticleListItem>>().toEqualTypeOf<ArticleListItemViewModel>();
  });

  it("projects only the exact public list facts from the v2 fixture", () => {
    expect(createThemeArticleListItem(bundle, article)).toEqual({
      link: {
        href: "/article/government24-resident-registration-guide",
        label: "정부24 주민등록등본 발급 방법",
      },
      summary: "정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다.",
      date: { dateTime: "2026-08-20T01:00:00Z", label: "2026년 8월 20일" },
      category: { href: "/category/daily-admin", label: "생활·행정" },
      topics: ["정부24"],
    });
  });

  it("uses a later material update in the release time zone", () => {
    expect(
      createThemeArticleListItem(bundle, {
        ...article,
        updatedAt: "2026-08-23T15:30:00Z",
      }).date,
    ).toEqual({
      dateTime: "2026-08-23T15:30:00Z",
      label: "2026년 8월 24일",
    });
  });

  it("fails closed with every missing taxonomy reference", () => {
    expect(() =>
      createThemeArticleListItem(bundle, {
        ...article,
        categoryId: "missing-category",
        tagIds: ["missing-tag"],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          expect.objectContaining({ path: "/article/categoryId" }),
          expect.objectContaining({ path: "/article/tagIds/0" }),
        ],
      }),
    );
  });
});
