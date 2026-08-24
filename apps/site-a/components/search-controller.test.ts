import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SearchController } from "./search-controller";
import type { SearchRouteViewModel } from "../lib/search-route-view-model";

const viewModel: SearchRouteViewModel = {
  release: {
    releaseId: "REL-1",
    siteId: "site-a",
    contractVersion: "2.0.0",
    bundleChecksum: `sha256:${"a".repeat(64)}`,
  },
  locale: "ko-KR",
  timeZone: "Asia/Seoul",
  searchIndexPath: "/search-index.json",
  categories: [
    { id: "daily-admin", href: "/category/daily-admin", label: "생활·행정" },
  ],
};

describe("SearchController", () => {
  it("renders a private bounded form and no-script discovery fallback", () => {
    const html = renderToStaticMarkup(
      createElement(SearchController, { viewModel }),
    );

    expect(html).toContain('<label for="site-search-query">찾고 싶은 안내</label>');
    expect(html).toContain('type="search" maxLength="120" autoComplete="off"');
    expect(html).not.toMatch(/<input[^>]+\sname=/);
    expect(html).toContain("검색어는 이 기기에서만 처리합니다.");
    expect(html).toContain('<a href="/category/daily-admin">생활·행정</a>');
    expect(html).toContain('<a href="/archive">전체 글 보기</a>');
  });
});
