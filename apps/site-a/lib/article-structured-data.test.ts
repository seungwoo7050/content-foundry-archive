import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import type { ResponsiveImageAsset } from "@content-foundry/media";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createArticleStructuredData,
  type ArticleStructuredDataContext,
  type ArticleStructuredDataSource,
} from "./article-structured-data";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const context = { canonicalOrigin: bundle.site.origin, site: bundle.site };
const article = bundle.articles[0]!;
const heroAsset: ResponsiveImageAsset = {
  fallback: {
    mediaId: "MED-HERO",
    relativePath: "_media/hero/source.webp",
    publicPath: "/_media/hero/source.webp",
    sha256: "a".repeat(64),
    mimeType: "image/webp",
    width: 1536,
    height: 1024,
    alt: "중립 추상 안내 이미지",
    credit: null,
    license: "QA only",
  },
  derivatives: [],
};

describe("article structured data", () => {
  it("accepts v3 facts and omits a non-material modification claim", () => {
    expectTypeOf<LoadedReleaseBundleV3["site"]>().toExtend<
      ArticleStructuredDataContext["site"]
    >();
    expectTypeOf<LoadedReleaseBundleV3["articles"][number]>().toExtend<ArticleStructuredDataSource>();

    const data = createArticleStructuredData(context, article);
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "정부24 주민등록등본 발급 방법",
      description: "정부24에서 주민등록등본을 발급하는 기본 절차를 정리합니다.",
      url: "https://example.com/article/government24-resident-registration-guide",
      inLanguage: "ko-KR",
      datePublished: "2026-08-20T01:00:00Z",
      author: { "@type": "Person", name: "생활메모" },
      publisher: { "@type": "Person", name: "생활메모" },
    });
  });

  it("adds only a release-backed later modification date", () => {
    const data = createArticleStructuredData(context, {
      ...article,
      updatedAt: "2026-08-24T02:30:00Z",
    });

    expect(data.dateModified).toBe("2026-08-24T02:30:00Z");
    expect(data).not.toHaveProperty("image");
    expect(data).not.toHaveProperty("reviewedBy");
    expect(data).not.toHaveProperty("lastReviewed");
  });

  it("adds only an explicitly prepared article hero image", () => {
    const data = createArticleStructuredData({
      ...context,
      mediaAssets: new Map([["MED-HERO", heroAsset]]),
    }, { ...article, heroMediaId: "MED-HERO" });

    expect(data.image).toBe("https://example.com/_media/hero/source.webp");
  });
});
