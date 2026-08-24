import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SearchResultList } from "./search-result-list";

const categories = [
  { id: "daily-admin", href: "/category/daily-admin", label: "생활·행정" },
];
const result = {
  score: 96,
  entry: {
    id: "ART-1",
    title: "정부24 발급 안내",
    summary: "온라인 발급 절차를 정리합니다.",
    path: "/article/government24-guide",
    updatedAt: "2026-08-20T01:00:00Z",
    category: { id: "daily-admin", slug: "daily-admin", label: "생활·행정" },
    tags: [],
    headings: [],
    keywords: [],
  },
};

describe("SearchResultList", () => {
  it("renders accessible result facts and update dates", () => {
    const html = renderToStaticMarkup(
      createElement(SearchResultList, {
        results: [result],
        categories,
        locale: "ko-KR",
        timeZone: "Asia/Seoul",
      }),
    );

    expect(html).toContain('<p role="status" aria-live="polite">1개의 안내');
    expect(html).toContain(
      '<a href="/article/government24-guide">정부24 발급 안내</a>',
    );
    expect(html).toContain("온라인 발급 절차를 정리합니다.");
    expect(html).toContain(
      '<time dateTime="2026-08-20T01:00:00Z">2026년 8월 20일</time>',
    );
  });

  it("offers category and archive links for zero results", () => {
    const html = renderToStaticMarkup(
      createElement(SearchResultList, {
        results: [],
        categories,
        locale: "ko-KR",
        timeZone: "Asia/Seoul",
      }),
    );

    expect(html).toContain("0개의 안내를 찾았습니다.");
    expect(html).toContain('<a href="/category/daily-admin">생활·행정</a>');
    expect(html).toContain('<a href="/archive">전체 글 보기</a>');
  });
});
