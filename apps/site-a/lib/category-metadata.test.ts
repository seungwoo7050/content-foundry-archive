import { resolve } from "node:path";

import type { LoadedReleaseBundleV3 } from "@content-foundry/content-contract";
import { resolveBuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createCategoryMetadata,
  type CategoryMetadataSource,
} from "./category-metadata";
import { loadSiteRelease, type SiteReleaseContextV3 } from "./load-site-release";
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

function getFixtureCategory() {
  const category = context.bundle.taxonomy.categories[0];
  if (!category) {
    throw new Error("Site A fixture category is missing");
  }
  return category;
}

describe("createCategoryMetadata", () => {
  it("accepts v3 category and release context metadata structures", () => {
    expectTypeOf<SiteReleaseContextV3>().toExtend<MetadataContext>();
    expectTypeOf<
      LoadedReleaseBundleV3["taxonomy"]["categories"][number]
    >().toExtend<CategoryMetadataSource>();
  });

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

  it("self-canonicalizes additional category pages", () => {
    expect(
      createCategoryMetadata(context, getFixtureCategory(), 2),
    ).toMatchObject({
      title: "생활·행정 2페이지",
      description: "생활과 행정 절차 안내 2페이지입니다.",
      alternates: {
        canonical: "https://example.com/category/daily-admin/page/2",
      },
      openGraph: {
        title: "생활·행정 2페이지",
        url: "https://example.com/category/daily-admin/page/2",
      },
      twitter: { title: "생활·행정 2페이지" },
    });
    expect(() => createCategoryMetadata(context, getFixtureCategory(), 0))
      .toThrow(RangeError);
  });
});
