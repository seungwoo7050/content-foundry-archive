import { resolve } from "node:path";

import { resolveBuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, it } from "vitest";

import { createArticleMetadata } from "./article-metadata";
import { loadSiteRelease } from "./load-site-release";

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
    expect(metadata.twitter).toMatchObject({ card: "summary", images: [] });
  });
});
