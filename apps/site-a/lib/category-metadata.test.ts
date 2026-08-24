import { resolve } from "node:path";

import { resolveBuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, it } from "vitest";

import { createCategoryMetadata } from "./category-metadata";
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

function getFixtureCategory() {
  const category = context.bundle.taxonomy.categories[0];
  if (!category) {
    throw new Error("Site A fixture category is missing");
  }
  return category;
}

describe("createCategoryMetadata", () => {
  it("projects category metadata while preserving template noindex", () => {
    expect(createCategoryMetadata(context, getFixtureCategory())).toEqual({
      title: "생활·행정",
      description: "생활과 행정 절차 안내",
      alternates: {
        canonical: "https://example.com/category/daily-admin",
      },
      robots: { index: false, follow: false },
      openGraph: {
        type: "website",
        title: "생활·행정",
        description: "생활과 행정 절차 안내",
        url: "https://example.com/category/daily-admin",
        images: [],
      },
      twitter: {
        card: "summary",
        title: "생활·행정",
        description: "생활과 행정 절차 안내",
        images: [],
      },
    });
  });

  it("provides a deterministic fallback for a blank description", () => {
    const category = { ...getFixtureCategory(), description: " \n " };
    const fallback = "생활·행정 카테고리의 안내 글을 모았습니다.";

    expect(createCategoryMetadata(context, category)).toMatchObject({
      description: fallback,
      openGraph: { description: fallback },
      twitter: { description: fallback },
    });
  });
});
