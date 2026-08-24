import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  findArticleBySlug,
  getArticleStaticParams,
  type ArticleRouteSource,
} from "./article-route";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("article route selection", () => {
  it("accepts and preserves v3 article route records", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ArticleRouteSource>();
    const article = findArticleBySlug(
      { articles: [] as LoadedReleaseBundleV3["articles"] },
      "missing",
    );
    expectTypeOf(article).toEqualTypeOf<
      LoadedReleaseBundleV3["articles"][number] | undefined
    >();
  });

  it("enumerates only validated release slugs", () => {
    expect(getArticleStaticParams(bundle)).toEqual([
      { slug: "government24-resident-registration-guide" },
    ]);
  });

  it("returns no article for a missing slug", () => {
    expect(findArticleBySlug(bundle, "missing-article")).toBeUndefined();
  });
});
