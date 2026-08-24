import { resolve } from "node:path";

import type { LoadedReleaseBundleV3 } from "@content-foundry/content-contract";
import { resolveBuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createArticleMetadata,
  type ArticleMetadataSource,
} from "./article-metadata";
import {
  loadSiteRelease,
  type SiteReleaseContextV3,
} from "./load-site-release";
import type { MetadataContext } from "./metadata-context";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const context = loadSiteRelease(
  resolveBuildTargetConfig({}, {
    siteId: "site-a",
    templateReleaseDirectory: fixture,
    allowedProductionOrigins: [],
  }),
);

describe("createArticleMetadata", () => {
  it("accepts v3 article and release context metadata structures", () => {
    expectTypeOf<SiteReleaseContextV3>().toExtend<MetadataContext>();
    expectTypeOf<
      LoadedReleaseBundleV3["articles"][number]
    >().toExtend<ArticleMetadataSource>();
  });

  it("projects article SEO while preserving template noindex", () => {
    const article = context.bundle.articles[0];
    if (!article) {
      throw new Error("Site A fixture article is missing");
    }

    const metadata = createArticleMetadata(context, article);

    expect(metadata.title).toBe("정부24 주민등록등본 발급 방법");
    expect(metadata.description).toBe("정부24 온라인 발급 절차를 정리합니다.");
    expect(metadata.alternates).toEqual({
      canonical:
        "https://example.com/article/government24-resident-registration-guide",
    });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      url: "https://example.com/article/government24-resident-registration-guide",
      images: [],
    });
    expect(metadata.openGraph).not.toHaveProperty("modifiedTime");
    expect(metadata.twitter).toMatchObject({ card: "summary", images: [] });
  });

  it("publishes modifiedTime only for a later material update", () => {
    const article = context.bundle.articles[0];
    if (!article) throw new Error("Site A fixture article is missing");

    expect(
      createArticleMetadata(context, {
        ...article,
        updatedAt: "2026-08-24T02:30:00Z",
      }).openGraph,
    ).toMatchObject({ modifiedTime: "2026-08-24T02:30:00Z" });
  });
});
