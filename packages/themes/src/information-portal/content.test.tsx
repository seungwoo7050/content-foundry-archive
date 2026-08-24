import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  CategoryRouteViewModel,
  HomeRouteViewModel,
} from "../content-route-view-model.js";
import { renderInformationPortalContent } from "./content.js";

const base = {
  path: "/",
  heading: "생활메모",
  description: "필요한 안내를 모았습니다.",
  breadcrumbs: [{ href: "/", label: "생활메모" }],
} as const;

describe("Information Portal discovery routes", () => {
  it("prioritizes search, described categories, and supplied latest content", () => {
    const route: HomeRouteViewModel = {
      ...base,
      kind: "home",
      articleSectionHeading: "최근 안내",
      articles: [{
        link: { href: "/article/start", label: "신청 안내" }, summary: "신청 절차",
        date: { kind: "published", dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
        estimatedReadingTime: { minutes: 2, label: "예상 읽기 시간 약 2분" },
        category: null, topics: [],
      }],
      categories: [{ href: "/category/life", label: "생활", description: "생활 절차를 확인합니다." }],
      searchLink: { href: "/search", label: "사이트 검색" },
      aboutTeaser: {
        href: "/about",
        label: "소개",
        description: "한 명의 운영자가 정보를 확인하고 정리합니다.",
      },
    };

    const html = renderToStaticMarkup(renderInformationPortalContent(route));

    expect(html.indexOf("사이트 검색")).toBeLessThan(html.indexOf("분야별 안내"));
    expect(html).toContain('class="ip-search-action" href="/search"');
    expect(html).toContain("생활 절차를 확인합니다.");
    expect(html).toContain('href="/article/start">신청 안내</a>');
    expect(html.match(/id="home-about-teaser-heading"/g)).toHaveLength(1);
    expect(html).toContain("한 명의 운영자가 정보를 확인하고 정리합니다.");
    expect(html).toContain('<a href="/about">소개</a>');
    expect(html).not.toMatch(/ranking|trending|popular|count|순위|인기/i);
  });

  it("omits an absent home about teaser", () => {
    const route: HomeRouteViewModel = {
      ...base,
      kind: "home",
      articleSectionHeading: "최근 안내",
      articles: [],
      categories: [],
      searchLink: null,
    };

    expect(renderToStaticMarkup(renderInformationPortalContent(route)))
      .not.toContain("home-about-teaser-heading");
  });

  it("keeps category topics and latest articles as distinct sections", () => {
    const route: CategoryRouteViewModel = {
      ...base,
      kind: "category",
      path: "/category/life",
      breadcrumbs: [{ href: "/category/life", label: "생활" }],
      articleSectionHeading: "최근 안내",
      articles: [],
      topicSectionHeading: "관련 주제",
      topics: ["신청", "발급"],
    };

    const html = renderToStaticMarkup(renderInformationPortalContent(route));

    expect(html).toContain('<ul class="ip-topics"><li>신청</li><li>발급</li></ul>');
    expect(html).toContain('<h2 id="ip-category-list">최근 안내</h2>');
  });
});
