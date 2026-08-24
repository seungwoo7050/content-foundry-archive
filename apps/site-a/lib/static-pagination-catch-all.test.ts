import { describe, expect, it } from "vitest";

import {
  getStaticPaginationCatchAllParams,
  resolveStaticPaginationCatchAll,
} from "./static-pagination-catch-all";

const category = { id: "guides", label: "안내", slug: "daily-guides" };
const source = {
  articles: Array.from({ length: 13 }, (_, index) => ({
    id: `article-${index}`,
    categoryId: category.id,
    publishedAt: "2026-08-20T01:00:00Z",
    seo: { canonicalPath: `/article/guide-${index}` },
  })),
  taxonomy: { categories: [category] },
};

describe("static pagination catch-all dispatch", () => {
  it("enumerates and resolves archive and category page-two routes", () => {
    expect(getStaticPaginationCatchAllParams(source)).toEqual([
      { pagePath: ["archive", "page", "2"] },
      { pagePath: ["category", "daily-guides", "page", "2"] },
    ]);
    expect(resolveStaticPaginationCatchAll(source, ["archive", "page", "2"]))
      .toEqual({ kind: "archive", page: 2 });
    expect(resolveStaticPaginationCatchAll(
      source,
      ["category", "daily-guides", "page", "2"],
    )).toEqual({ kind: "category", category, page: 2 });
  });

  it.each([
    ["archive", "page", "1"],
    ["archive", "page", "02"],
    ["category", "daily-guides", "page", "3"],
    ["other", "page", "2"],
  ])("rejects a non-generated path %j", (...pagePath) => {
    expect(resolveStaticPaginationCatchAll(source, pagePath)).toBeNull();
  });
});
