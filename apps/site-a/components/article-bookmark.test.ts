import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ArticleBookmark, articleBookmarkStorageKey, decodeArticleBookmarks,
  encodeArticleBookmarks, readArticleBookmark, toggleArticleBookmark,
} from "./article-bookmark";

function memoryStorage() {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value) };
}

describe("ArticleBookmark", () => {
  it("uses a site-scoped deterministic ID-only codec", () => {
    expect(articleBookmarkStorageKey("site-a")).toBe(
      "content-foundry:site-a:article-bookmarks:v1",
    );
    expect(encodeArticleBookmarks(["ART-2", "ART-1", "ART-2"])).toBe(
      '{"version":1,"articleIds":["ART-1","ART-2"]}',
    );
    expect(() => encodeArticleBookmarks(["기사 제목"])).toThrow();
    expect(() => encodeArticleBookmarks(["https://example.com/article"])).toThrow();
    expect(decodeArticleBookmarks("not json")).toEqual([]);
    expect(decodeArticleBookmarks('{"version":1,"articleIds":["ART-1"],"title":"private"}')).toEqual([]);
  });

  it("toggles one stable ID and fails safely when storage is unavailable", () => {
    const storage = memoryStorage();
    expect(toggleArticleBookmark(storage, "site-a", "ART-000123")).toBe("bookmarked");
    expect(readArticleBookmark(storage, "site-a", "ART-000123")).toBe("bookmarked");
    expect(toggleArticleBookmark(storage, "site-a", "ART-000123")).toBe("not-bookmarked");
    const denied = { getItem: () => { throw new Error("denied"); }, setItem: () => {} };
    expect(readArticleBookmark(denied, "site-a", "ART-000123")).toBe("unavailable");
    const writeDenied = { getItem: () => null, setItem: () => { throw new Error("denied"); } };
    expect(toggleArticleBookmark(writeDenied, "site-a", "ART-000123")).toBe("unavailable");
  });

  it("announces an honest status while browser storage is unchecked", () => {
    const html = renderToStaticMarkup(createElement(ArticleBookmark, {
      siteId: "site-a", articleId: "ART-000123",
    }));
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("disabled");
    expect(html).toContain("기사 저장 상태를 확인하고 있습니다.");
  });
});
