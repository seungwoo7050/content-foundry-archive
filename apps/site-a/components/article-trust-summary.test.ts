import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArticleTrustSummary } from "./article-trust-summary";

const published = {
  dateTime: "2026-08-20T01:00:00Z",
  label: "2026년 8월 20일",
};

describe("ArticleTrustSummary", () => {
  it("renders visible identity and publication without a false update", () => {
    const html = renderToStaticMarkup(
      createElement(ArticleTrustSummary, {
        authorLabel: "생활메모",
        operatorLabel: "생활메모",
        published,
        updated: null,
        aboutPath: "/about",
        contactPath: null,
      }),
    );

    expect(html).toContain('<h2 id="article-trust-title">이 안내의 정보</h2>');
    expect(html).toContain("<dt>작성</dt><dd>생활메모</dd>");
    expect(html).toContain("<dt>운영</dt><dd>생활메모</dd>");
    expect(html).toContain(
      '<dt>게시</dt><dd><time dateTime="2026-08-20T01:00:00Z">2026년 8월 20일</time>',
    );
    expect(html).not.toContain("<dt>수정</dt>");
    expect(html).toContain('<a href="/about">운영 방식 보기</a>');
  });

  it("renders a material update and every available trust-page action", () => {
    const html = renderToStaticMarkup(
      createElement(ArticleTrustSummary, {
        authorLabel: "작성자",
        operatorLabel: "운영자",
        published,
        updated: {
          dateTime: "2026-08-24T02:30:00Z",
          label: "2026년 8월 24일",
        },
        aboutPath: "/about",
        contactPath: "/contact",
      }),
    );

    expect(html).toContain(
      '<dt>수정</dt><dd><time dateTime="2026-08-24T02:30:00Z">2026년 8월 24일</time>',
    );
    expect(html).toContain('<a href="/contact">수정 요청하기</a>');
  });
});
