import { createElement } from "react";

import type { SearchRouteViewModel } from "@content-foundry/themes";
import { describe, expect, expectTypeOf, it } from "vitest";

import { createSearchThemePageViewModel } from "./search-theme-page-view-model";

describe("search theme page view model", () => {
  it("projects only public search-route facts and preserves its client slot", () => {
    const client = createElement("form", null, "검색 폼");
    const model = createSearchThemePageViewModel(
      { site: { name: "생활메모" } },
      client,
    );

    expectTypeOf(model).toEqualTypeOf<SearchRouteViewModel>();
    expect(model).toEqual({
      kind: "search",
      path: "/search",
      heading: "검색",
      description:
        "게시된 안내를 검색합니다. 검색어는 외부로 전송하지 않습니다.",
      breadcrumbs: [
        { href: "/", label: "생활메모" },
        { href: "/search", label: "검색" },
      ],
      client,
    });
    expect(model.client).toBe(client);
    expect(model).not.toHaveProperty("release");
    expect(model).not.toHaveProperty("searchIndexPath");
    expect(model).not.toHaveProperty("categories");
  });
});
