import { describe, expect, it } from "vitest";

import type { SearchIndexEntry } from "./search-index-entry";
import { MAX_SEARCH_RESULTS, searchIndexEntries } from "./search-results";

function entry(
  path: string,
  title: string,
  updatedAt = "2026-08-20T00:00:00Z",
  summary = "none",
): SearchIndexEntry {
  return {
    id: path,
    title,
    summary,
    path,
    updatedAt,
    category: { id: "category", slug: "category", label: "분류" },
    tags: [],
    headings: [],
    keywords: [],
  };
}

describe("search result ranking", () => {
  it("sorts by score, update date, and canonical path", () => {
    const results = searchIndexEntries(
      [
        entry("/article/summary", "none", "2026-08-30T00:00:00Z", "needle"),
        entry("/article/old", "needle", "2026-08-20T00:00:00Z"),
        entry("/article/b", "needle", "2026-08-30T00:00:00Z"),
        entry("/article/a", "needle", "2026-08-30T00:00:00Z"),
      ],
      "needle",
      "ko-KR",
    );

    expect(results.map(({ entry: result }) => result.path)).toEqual([
      "/article/a",
      "/article/b",
      "/article/old",
      "/article/summary",
    ]);
  });

  it("returns at most twenty deterministic matches", () => {
    const candidates = Array.from({ length: 25 }, (_, index) =>
      entry(`/article/${String(24 - index).padStart(2, "0")}`, "needle"),
    );
    const results = searchIndexEntries(candidates, "needle", "ko-KR");

    expect(results).toHaveLength(MAX_SEARCH_RESULTS);
    expect(results[0]?.entry.path).toBe("/article/00");
    expect(results.at(-1)?.entry.path).toBe("/article/19");
  });

  it("returns no results for an empty or punctuation-only query", () => {
    expect(searchIndexEntries([entry("/article/a", "needle")], " .* ", "ko-KR"))
      .toEqual([]);
  });
});
