import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { HomeRouteViewModel } from "../content-route-view-model.js";
import { renderFriendlyContentRoute } from "./content.js";

const base = {
  path: "/",
  heading: "생활메모",
  description: "필요한 안내를 정리합니다.",
  breadcrumbs: [{ href: "/", label: "생활메모" }],
} as const;

describe("Friendly Mobile Utility content routes", () => {
  it("renders search, described task cards, and latest action rows on home", () => {
    const route: HomeRouteViewModel = {
      ...base,
      kind: "home",
      articleSectionHeading: "최근 안내",
      articles: [{
        link: { href: "/article/start", label: "신청 안내" }, summary: "신청 절차",
        date: { dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
        category: null, topics: [],
      }],
      categories: [{ href: "/category/life", label: "생활", description: "생활 절차를 확인합니다." }],
      searchLink: { href: "/search", label: "사이트 검색" },
    };

    const html = renderToStaticMarkup(renderFriendlyContentRoute(route));

    expect(html).toContain('class="fmu-action fmu-primary" href="/search"');
    expect(html).toContain('href="/category/life">생활</a>');
    expect(html).toContain("생활 절차를 확인합니다.");
    expect(html).toContain('href="/article/start">신청 안내</a>');
    expect(html).not.toMatch(/popular|trending|ranking|인기|순위/i);
  });

});
