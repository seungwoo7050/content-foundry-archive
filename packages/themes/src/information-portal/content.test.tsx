import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  ArchiveRouteViewModel,
  CategoryRouteViewModel,
  HomeRouteViewModel,
} from "../content-route-view-model.js";
import type { PaginationViewModel } from "../presentation-view-model.js";
import { renderInformationPortalContent } from "./content.js";

const base = {
  path: "/",
  heading: "생활메모",
  description: "필요한 안내를 모았습니다.",
  breadcrumbs: [{ href: "/", label: "생활메모" }],
} as const;

function renderListRoute(kind: "archive" | "category", pagination: PaginationViewModel) {
  const basePath = kind === "archive" ? "/archive" : "/category/life";
  const path = pagination.currentPage === 1
    ? basePath
    : `${basePath}/page/${pagination.currentPage}`;
  const shared = {
    path,
    heading: kind === "archive" ? "전체 안내" : "생활",
    description: "페이지로 나눈 안내 목록입니다.",
    breadcrumbs: [{ href: path, label: "현재 목록" }],
    articles: [],
    pagination,
  };
  const route: ArchiveRouteViewModel | CategoryRouteViewModel = kind === "archive"
    ? { ...shared, kind }
    : {
        ...shared,
        kind,
        articleSectionHeading: "최근 안내",
        topicSectionHeading: null,
        topics: [],
      };
  return renderToStaticMarkup(renderInformationPortalContent(route));
}

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
      pagination: { currentPage: 1, pageCount: 1, previous: null, next: null },
      topicSectionHeading: "관련 주제",
      topics: ["신청", "발급"],
    };

    const html = renderToStaticMarkup(renderInformationPortalContent(route));

    expect(html).toContain('<ul class="ip-topics"><li>신청</li><li>발급</li></ul>');
    expect(html).toContain('<h2 id="ip-category-list">최근 안내</h2>');
  });

  it.each(["category", "archive"] as const)(
    "omits pagination markup from a one-page %s list",
    (kind) => {
      const html = renderListRoute(kind, {
        currentPage: 1,
        pageCount: 1,
        previous: null,
        next: null,
      });

      expect(html).not.toContain('aria-label="목록 페이지 이동"');
    },
  );

  it.each([
    ["category", "/category/life", "/category/life/page/3"],
    ["archive", "/archive", "/archive/page/3"],
  ] as const)(
    "renders real pagination anchors after the %s article list",
    (kind, previousHref, nextHref) => {
      const html = renderListRoute(kind, {
        currentPage: 2,
        pageCount: 3,
        previous: { href: previousHref, label: "이전 페이지" },
        next: { href: nextHref, label: "다음 페이지" },
      });
      const emptyArticleList = kind === "archive" ? "<ol></ol>" : "<ul></ul>";

      expect(html.indexOf(emptyArticleList)).toBeLessThan(
        html.indexOf('aria-label="목록 페이지 이동"'),
      );
      expect(html).toContain(
        `<a href="${previousHref}" rel="prev">이전 페이지</a>`,
      );
      expect(html).toContain(
        `<a href="${nextHref}" rel="next">다음 페이지</a>`,
      );
    },
  );
});
