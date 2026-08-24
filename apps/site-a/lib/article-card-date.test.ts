import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  getArticleCardDate,
  type ArticleCardDateSource,
} from "./article-card-date";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const article = loadReleaseBundle(fixture).articles[0];
if (!article) {
  throw new Error("Site A fixture article is missing");
}

describe("getArticleCardDate", () => {
  it("accepts v3 article date fields", () => {
    expectTypeOf<
      LoadedReleaseBundleV3["articles"][number]
    >().toExtend<ArticleCardDateSource>();
  });

  it("shows the publication date when no later review exists", () => {
    expect(getArticleCardDate(article)).toEqual({
      label: "게시",
      dateTime: "2026-08-20T01:00:00Z",
    });
  });

  it("shows a later material update", () => {
    const updatedAt = "2026-08-24T03:00:00Z";

    expect(getArticleCardDate({ ...article, updatedAt })).toEqual({
      label: "업데이트",
      dateTime: updatedAt,
    });
  });
});
