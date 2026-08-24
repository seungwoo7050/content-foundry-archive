import { resolve } from "node:path";
import { createElement } from "react";

import {
  loadReleaseBundle,
  loadV3ReleaseBundle,
  type LoadedReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { ArticleRouteViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import { getGeneratedRoutes } from "./generated-routes";
import {
  createArticleThemeViewModel,
  type ArticleThemeContext,
  type ArticleThemeRecord,
} from "./article-theme-view-model";
import type {
  SiteReleaseContext,
  SiteReleaseContextV3,
} from "./load-site-release";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const v3Fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/3.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const v3Bundle = loadV3ReleaseBundle(v3Fixture, {
  resolveConsumerContext: (candidate) => ({
    generatedRoutes: getGeneratedRoutes(candidate),
    nicheComponentRegistry: { "site-a": [] },
  }),
});

function firstArticle<T extends LoadedReleaseBundle | LoadedReleaseBundleV3>(
  release: T,
): T["articles"][number] {
  const article = release.articles[0];
  if (!article) throw new Error("Missing article fixture");
  return article;
}

function categoryFor(
  release: LoadedReleaseBundle | LoadedReleaseBundleV3,
  categoryId: string,
) {
  const category = release.taxonomy.categories.find(({ id }) => id === categoryId);
  if (!category) throw new Error(`Missing category fixture: ${categoryId}`);
  return category;
}

describe("article theme view model", () => {
  it("accepts both release contexts and returns the closed theme contract", () => {
    expectTypeOf<SiteReleaseContext>().toExtend<ArticleThemeContext>();
    expectTypeOf<SiteReleaseContextV3>().toExtend<ArticleThemeContext>();
    expectTypeOf<LoadedReleaseBundle["articles"][number]>().toExtend<ArticleThemeRecord>();
    expectTypeOf<LoadedReleaseBundleV3["articles"][number]>().toExtend<ArticleThemeRecord>();
    expectTypeOf<ReturnType<typeof createArticleThemeViewModel>>()
      .toEqualTypeOf<ArticleRouteViewModel>();
  });

  it("exactly projects the minimal v2 article without an invented update", () => {
    const article = firstArticle(bundle);
    const hero = null;
    const body = "본문 슬롯";
    expect(createArticleThemeViewModel(
      { config: { adsEnabled: false }, bundle },
      article,
      categoryFor(bundle, article.categoryId),
      { hero, body },
    )).toEqual({
      kind: "article",
      path: "/article/government24-resident-registration-guide",
      heading: "정부24 주민등록등본 발급 방법",
      description: "정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다.",
      breadcrumbs: [
        { href: "/", label: "생활메모" },
        { href: "/category/daily-admin", label: "생활·행정" },
        { href: "/article/government24-resident-registration-guide", label: "정부24 주민등록등본 발급 방법" },
      ],
      category: { href: "/category/daily-admin", label: "생활·행정" },
      topics: ["정부24"],
      authorLabel: "생활메모",
      operatorLabel: "생활메모",
      published: { dateTime: "2026-08-20T01:00:00Z", label: "2026년 8월 20일" },
      updated: null,
      trustLinks: [{ href: "/about", label: "운영 방식 보기" }],
      toc: [{ id: "prepare", label: "준비하기", level: 2 }],
      sources: [],
      updateTriggers: [],
      faq: [],
      relatedSectionHeading: null,
      relatedArticles: [],
      advertisingEligible: false,
      readerActions: null,
      hero,
      body,
    });
  });

  it("projects v3 updates, safe evidence, TOC, and an actual related item only", () => {
    const article = firstArticle(v3Bundle);
    const related = { ...article, id: "ART-000999", title: "관련 글", seo: { ...article.seo, canonicalPath: "/article/related" } };
    const changed = {
      ...article,
      relatedArticleIds: [related.id],
      sourceDisclosures: [
        { label: "공식 출처", url: "https://official.example/guide" },
        { label: "이메일", url: "mailto:unsafe@example.com" },
      ],
      updateTriggers: ["공식 절차 변경"],
      faq: [{ question: "질문?", answerMarkdown: "답변" }],
    };
    const readerActions = createElement("button", null, "독자 도구");
    const model = createArticleThemeViewModel(
      { config: { adsEnabled: false }, bundle: { ...v3Bundle, articles: [changed, related] } },
      changed,
      categoryFor(v3Bundle, article.categoryId),
      { readerActions, hero: "hero", body: "body" },
    );

    expect(model).toMatchObject({
      updated: { dateTime: "2026-08-24T02:30:00Z", label: "2026년 8월 24일" },
      toc: [{ id: "prepare", label: "준비하기", level: 2 }],
      sources: [
        { label: "공식 출처", href: "https://official.example/guide" },
        { label: "이메일", href: null },
      ],
      updateTriggers: ["공식 절차 변경"],
      faq: [{ question: "질문?", answer: "답변" }],
      relatedSectionHeading: "관련 안내",
      relatedArticles: [{ link: { href: "/article/related", label: "관련 글" } }],
      advertisingEligible: false,
    });
    expect(model).not.toHaveProperty("lastVerified");
    expect(model).not.toHaveProperty("reviewer");
    expect(model).not.toHaveProperty("readingTime");
    expect(model.readerActions).toBe(readerActions);
    expect(JSON.stringify(model.sources)).not.toContain("mailto:");
  });

  it("projects topic labels in tagIds order and preserves an empty list", () => {
    const article = firstArticle(bundle);
    const secondTag = {
      ...bundle.taxonomy.tags[0]!,
      id: "second-tag",
      slug: "second-tag",
      label: "두 번째 태그",
    };
    const orderedBundle = {
      ...bundle,
      taxonomy: {
        ...bundle.taxonomy,
        tags: [...bundle.taxonomy.tags, secondTag],
      },
    };
    const project = (tagIds: readonly string[]) => createArticleThemeViewModel(
      { config: { adsEnabled: false }, bundle: orderedBundle },
      { ...article, tagIds },
      categoryFor(bundle, article.categoryId),
      { hero: null, body: "body" },
    ).topics;

    expect(project([secondTag.id, article.tagIds[0]!])).toEqual([
      "두 번째 태그",
      "정부24",
    ]);
    expect(project([])).toEqual([]);
  });

  it("fails closed when an article topic ID is missing from taxonomy", () => {
    const article = firstArticle(bundle);
    expect(() => createArticleThemeViewModel(
      { config: { adsEnabled: false }, bundle },
      { ...article, tagIds: ["missing-tag"] },
      categoryFor(bundle, article.categoryId),
      { hero: null, body: "body" },
    )).toThrowError(expect.objectContaining({
      code: "REFERENCE_INVALID",
      issues: [expect.objectContaining({ path: "/article/tagIds/0" })],
    }));
  });

  it.each([null, undefined])("normalizes empty reader actions from %s", (readerActions) => {
    const article = firstArticle(bundle);
    const model = createArticleThemeViewModel(
      { config: { adsEnabled: false }, bundle },
      article,
      categoryFor(bundle, article.categoryId),
      { readerActions, hero: null, body: "body" },
    );

    expect(model.readerActions).toBeNull();
  });
});
