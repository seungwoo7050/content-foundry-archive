import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RetiredRoute } from "./retired-route";

describe("RetiredRoute", () => {
  it("links directly to the validated replacement", () => {
    const html = renderToStaticMarkup(
      createElement(RetiredRoute, {
        path: "/article/retired-guide",
        replacementPath: "/article/current-guide",
      }),
    );

    expect(html).toContain("<p>410</p>");
    expect(html).toContain(
      '<h1 id="retired-route-title">더 이상 제공하지 않는 페이지입니다</h1>',
    );
    expect(html).toContain("<code>/article/retired-guide</code>");
    expect(html).toContain(
      '<a href="/article/current-guide">대신 볼 수 있는 안내로 이동</a>',
    );
  });

  it("falls back to the chronological archive without unsafe markup", () => {
    const html = renderToStaticMarkup(
      createElement(RetiredRoute, {
        path: '/old"><script>alert(1)</script>',
        replacementPath: null,
      }),
    );

    expect(html).toContain('<a href="/archive">전체 글 보기</a>');
    expect(html).toContain(
      "<code>/old&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;</code>",
    );
    expect(html).not.toContain("<script>");
  });
});
