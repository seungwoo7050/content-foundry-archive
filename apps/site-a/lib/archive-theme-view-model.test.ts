import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { ArchiveRouteViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createArchiveThemeViewModel,
  type ArchiveThemeSource,
} from "./archive-theme-view-model";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const article = bundle.articles[0]!;

describe("archive theme view model", () => {
  it("accepts both releases and returns the closed archive contract", () => {
    expectTypeOf<LoadedReleaseBundle>().toExtend<ArchiveThemeSource>();
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ArchiveThemeSource>();
    expectTypeOf<ReturnType<typeof createArchiveThemeViewModel>>()
      .toEqualTypeOf<ArchiveRouteViewModel>();
  });

  it("exactly projects truthful archive and public article facts", () => {
    const model = createArchiveThemeViewModel(bundle);

    expect(model).toEqual({
      kind: "archive",
      path: "/archive",
      heading: "전체 글",
      description: "생활메모의 안내 글을 게시일 최신순으로 모았습니다.",
      breadcrumbs: [
        { href: "/", label: "생활메모" },
        { href: "/archive", label: "전체 글" },
      ],
      articles: [
        {
          link: {
            href: "/article/government24-resident-registration-guide",
            label: "정부24 주민등록등본 발급 방법",
          },
          summary: "정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다.",
          date: {
            kind: "published",
            dateTime: "2026-08-20T01:00:00Z",
            label: "2026년 8월 20일",
          },
          estimatedReadingTime: {
            minutes: 1,
            label: "예상 읽기 시간 약 1분",
          },
          category: { href: "/category/daily-admin", label: "생활·행정" },
          topics: ["정부24"],
        },
      ],
      pagination: {
        currentPage: 1,
        pageCount: 1,
        previous: null,
        next: null,
      },
    });
    expect(model).not.toHaveProperty("count");
    expect(JSON.stringify(model)).not.toMatch(/ART-|popularity|ranking/);
  });

  it("keeps the existing published-latest deterministic ordering", () => {
    const olderUpdated = {
      ...article,
      id: "ART-OLDER",
      title: "이전 게시 글",
      publishedAt: "2026-08-20T00:00:00Z",
      updatedAt: "2026-08-25T00:00:00Z",
      seo: { ...article.seo, canonicalPath: "/article/older" },
    };
    const newlyPublished = {
      ...article,
      id: "ART-NEWER",
      title: "새 게시 글",
      publishedAt: "2026-08-24T00:00:00Z",
      updatedAt: "2026-08-24T00:00:00Z",
      seo: { ...article.seo, canonicalPath: "/article/newer" },
    };

    const model = createArchiveThemeViewModel({
      ...bundle,
      articles: [olderUpdated, newlyPublished],
    });

    expect(model.articles.map(({ link }) => link.href)).toEqual([
      "/article/newer",
      "/article/older",
    ]);
    expect(model.articles[1]!.date).toEqual({
      kind: "published",
      dateTime: "2026-08-20T00:00:00Z",
      label: "2026년 8월 20일",
    });
  });

  it("projects a page-two path, breadcrumb, slice, and navigation", () => {
    const articles = Array.from({ length: 13 }, (_, index) => ({
      ...article,
      id: `ART-${String(index + 1).padStart(6, "0")}`,
      title: `안내 ${index + 1}`,
      seo: {
        ...article.seo,
        canonicalPath: `/article/guide-${index + 1}`,
      },
    }));

    const model = createArchiveThemeViewModel({ ...bundle, articles }, 2);

    expect(model).toMatchObject({
      path: "/archive/page/2",
      heading: "전체 글 2페이지",
      description: "생활메모의 안내 글을 게시일 최신순으로 모았습니다. 2페이지입니다.",
      breadcrumbs: [
        { href: "/", label: "생활메모" },
        { href: "/archive", label: "전체 글" },
        { href: "/archive/page/2", label: "2페이지" },
      ],
      pagination: {
        currentPage: 2,
        pageCount: 2,
        previous: { href: "/archive", label: "이전 페이지" },
        next: null,
      },
    });
    expect(model.articles.map(({ link }) => link.href)).toEqual([
      "/article/guide-13",
    ]);
    expect(() => createArchiveThemeViewModel({ ...bundle, articles }, 3))
      .toThrow(RangeError);
  });

  it("preserves fail-closed taxonomy validation", () => {
    expect(() =>
      createArchiveThemeViewModel({
        ...bundle,
        articles: [{ ...article, categoryId: "missing-category" }],
      }),
    ).toThrowError(expect.objectContaining({ code: "REFERENCE_INVALID" }));
  });
});
