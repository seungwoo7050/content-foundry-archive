import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ArticleBreadcrumbs } from "./article-breadcrumbs";

describe("ArticleBreadcrumbs", () => {
  it("links ancestors and marks only the current article", () => {
    const html = renderToStaticMarkup(
      createElement(ArticleBreadcrumbs, {
        items: [
          { label: "생활메모", path: "/", current: false },
          {
            label: "생활·행정",
            path: "/category/daily-admin",
            current: false,
          },
          {
            label: "정부24 주민등록등본 발급 방법",
            path: "/article/government24-resident-registration-guide",
            current: true,
          },
        ],
      }),
    );

    expect(html).toBe(
      '<nav aria-label="현재 위치"><ol><li><a href="/">생활메모</a></li><li><a href="/category/daily-admin">생활·행정</a></li><li><span aria-current="page">정부24 주민등록등본 발급 방법</span></li></ol></nav>',
    );
  });

  it("omits an empty breadcrumb landmark", () => {
    expect(
      renderToStaticMarkup(createElement(ArticleBreadcrumbs, { items: [] })),
    ).toBe("");
  });
});
