import { describe, expect, it } from "vitest";

import type { SearchIndexEntry } from "./search-index-entry";
import {
  createLexicalSearchQuery,
  scoreSearchEntry,
} from "./search-score";

function entry(overrides: Partial<SearchIndexEntry>): SearchIndexEntry {
  return {
    id: "ART-1",
    title: "none",
    summary: "none",
    path: "/article/one",
    updatedAt: "2026-08-20T00:00:00Z",
    category: { id: "category", slug: "none", label: "none" },
    tags: [],
    headings: [],
    keywords: [],
    ...overrides,
  };
}

describe("lexical search scoring", () => {
  it.each([
    [entry({ title: "prefix needle suffix" }), 48],
    [entry({ category: { id: "c", slug: "needle", label: "none" } }), 16],
    [entry({ tags: [{ id: "t", slug: "needle", label: "none" }] }), 12],
    [entry({ headings: [{ id: "h", text: "needle" }] }), 8],
    [entry({ summary: "summary needle" }), 8],
    [entry({ keywords: ["needle"] }), 2],
  ])("uses the strongest matching field weight", (candidate, expected) => {
    const query = createLexicalSearchQuery("needle", "ko-KR");
    expect(scoreSearchEntry(candidate, query, "ko-KR")).toBe(expected);
  });

  it("requires every bounded token without evaluating query syntax", () => {
    const query = createLexicalSearchQuery("alpha .* beta", "ko-KR");

    expect(
      scoreSearchEntry(
        entry({ title: "alpha guide", summary: "contains beta" }),
        query,
        "ko-KR",
      ),
    ).toBe(36);
    expect(
      scoreSearchEntry(entry({ title: "alpha only" }), query, "ko-KR"),
    ).toBeNull();
  });

  it("rewards exact and prefix title phrases deterministically", () => {
    const query = createLexicalSearchQuery("정부24 발급", "ko-KR");
    const exact = scoreSearchEntry(entry({ title: "정부24 발급" }), query, "ko-KR");
    const prefix = scoreSearchEntry(
      entry({ title: "정부24 발급 안내" }),
      query,
      "ko-KR",
    );

    expect(exact).toBe(128);
    expect(prefix).toBe(96);
  });
});
