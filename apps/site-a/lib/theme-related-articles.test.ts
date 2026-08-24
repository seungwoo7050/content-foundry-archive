import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createRelatedThemeArticleItems,
  type RelatedThemeArticleOwner,
  type RelatedThemeArticleSource,
} from "./theme-related-articles";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const article = bundle.articles[0]!;

describe("related theme article items", () => {
  it("accepts v3 article and bundle structures", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<RelatedThemeArticleSource>();
    expectTypeOf<
      LoadedReleaseBundleV3["articles"][number]
    >().toExtend<RelatedThemeArticleOwner>();
  });

  it("preserves explicit related order as public list facts", () => {
    const related = {
      ...article,
      id: "ART-000999",
      title: "함께 보는 안내",
      seo: { ...article.seo, canonicalPath: "/article/related-guide" },
    };
    const items = createRelatedThemeArticleItems(
      { ...bundle, articles: [article, related] },
      { relatedArticleIds: [related.id] },
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.link).toEqual({
      href: "/article/related-guide",
      label: "함께 보는 안내",
    });
  });

  it("keeps an absent related section empty", () => {
    expect(createRelatedThemeArticleItems(bundle, article)).toEqual([]);
  });

  it("fails closed for every missing related reference", () => {
    expect(() =>
      createRelatedThemeArticleItems(bundle, {
        relatedArticleIds: ["ART-missing-1", "ART-missing-2"],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          expect.objectContaining({ path: "/article/relatedArticleIds/0" }),
          expect.objectContaining({ path: "/article/relatedArticleIds/1" }),
        ],
      }),
    );
  });
});
