import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReleaseNavigation } from "./release-navigation";

describe("ReleaseNavigation", () => {
  it("renders nested release navigation in source order", () => {
    const html = renderToStaticMarkup(
      createElement(ReleaseNavigation, {
        items: [
          { id: "home", label: "홈", path: "/", children: [] },
          {
            id: "guides",
            label: "안내",
            path: "/category/daily-admin",
            children: [
              {
                id: "about",
                label: "소개",
                path: "/about",
                children: [],
              },
            ],
          },
        ],
      }),
    );

    expect(html).toBe(
      '<nav aria-label="주요 메뉴"><ul><li><a href="/">홈</a></li><li><a href="/category/daily-admin">안내</a><ul><li><a href="/about">소개</a></li></ul></li></ul></nav>',
    );
  });

  it("omits an empty navigation landmark", () => {
    expect(
      renderToStaticMarkup(createElement(ReleaseNavigation, { items: [] })),
    ).toBe("");
  });
});
