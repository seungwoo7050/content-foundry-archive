import { describe, expect, it } from "vitest";

import {
  MAX_SEARCH_QUERY_CODE_POINTS,
  MAX_SEARCH_QUERY_TOKENS,
  normalizeSearchText,
  tokenizeSearchQuery,
} from "./search-text";

describe("search text normalization", () => {
  it("normalizes compatibility forms, case, and whitespace", () => {
    expect(normalizeSearchText("  ＧｏＶ\n24  안내  ", "ko-KR")).toBe(
      "gov 24 안내",
    );
  });

  it("deduplicates bounded tokens without interpreting regular expressions", () => {
    expect(tokenizeSearchQuery("정부24 (발급)+정부24 .* 안내", "ko-KR")).toEqual([
      "정부24",
      "발급",
      "안내",
    ]);
  });

  it("limits adversarial query length and token count", () => {
    const query = Array.from(
      { length: MAX_SEARCH_QUERY_CODE_POINTS + 20 },
      (_, index) => `단어${index}`,
    ).join(" ");
    const tokens = tokenizeSearchQuery(query, "ko-KR");

    expect(tokens).toHaveLength(MAX_SEARCH_QUERY_TOKENS);
    expect(tokens.at(-1)).toBe("단어11");
  });
});
