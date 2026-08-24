import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { HtmlRouteViewModel } from "../html-route-view-model.js";
import type {
  ArticleListItemViewModel,
  SiteShellViewModel,
} from "../presentation-view-model.js";
import { SKIN_TOKENS } from "../skin.js";
import { friendlyMobileUtilityTheme } from "./module.js";

const shell: SiteShellViewModel = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 정보를 정리합니다.",
  primaryNavigation: [{ link: { href: "/", label: "홈" }, children: [] }],
  footerText: "© 2026 생활메모",
};
const article: ArticleListItemViewModel = {
  link: { href: "/article/guide", label: "생활 안내" },
  summary: "필요한 절차를 정리합니다.",
  date: { kind: "published", dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
  estimatedReadingTime: { minutes: 2, label: "예상 읽기 시간 약 2분" },
  category: { href: "/category/life", label: "생활" },
  topics: ["절차"],
};
const base = (path: string, heading: string) => ({
  path,
  heading,
  description: `${heading} 설명`,
  breadcrumbs: [{ href: path, label: heading }],
});
const routes: readonly HtmlRouteViewModel[] = [
  {
    ...base("/", "홈"), kind: "home", articleSectionHeading: "최근 안내",
    articles: [article], categories: [{ href: "/category/life", label: "생활", description: "생활 절차 안내" }],
    searchLink: { href: "/search", label: "사이트 검색" },
  },
  {
    ...base("/category/life", "생활"), kind: "category", articleSectionHeading: "최근 안내",
    articles: [article], pagination: { currentPage: 1, pageCount: 1, previous: null, next: null }, topicSectionHeading: "관련 주제", topics: ["신청"],
  },
  {
    ...base("/article/guide", "생활 안내"), kind: "article",
    category: { href: "/category/life", label: "생활" }, authorLabel: "작성자", operatorLabel: "운영자",
    published: { dateTime: "2026-08-20T00:00:00Z", label: "2026년 8월 20일" },
    updated: { dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
    estimatedReadingTime: undefined,
    trustLinks: [{ href: "/about", label: "운영 방식" }],
    toc: [{ id: "step", label: "신청 단계", level: 2 }],
    sources: [{ label: "공식 안내", href: "https://official.example/guide" }],
    updateTriggers: ["공식 절차 변경"], faq: [{ question: "필요한 것은?", answer: "신분증입니다." }],
    relatedSectionHeading: "관련 안내", relatedArticles: [article], advertisingEligible: true,
    hero: <figure>대표 이미지</figure>, body: <section id="step">신청 본문</section>,
  },
  { ...base("/about", "소개"), kind: "static-page", body: <p>운영 원칙</p> },
  { ...base("/archive", "전체 글"), kind: "archive", articles: [article], pagination: { currentPage: 1, pageCount: 1, previous: null, next: null } },
  { ...base("/search", "검색"), kind: "search", client: <form>검색 폼</form> },
  { ...base("/404", "페이지를 찾을 수 없습니다"), kind: "not-found", statusCode: 404, action: { href: "/", label: "홈으로" } },
  { ...base("/retired", "종료된 안내"), kind: "retired", statusCode: 410, action: { href: "/archive", label: "전체 글" } },
];

describe("Friendly Mobile Utility route matrix", () => {
  it("covers every declared route kind exactly once", () => {
    expect(routes.map(({ kind }) => kind)).toEqual(
      friendlyMobileUtilityTheme.qualityExpectations.routeKinds,
    );
  });

  for (const route of routes) {
    it(`renders the complete ${route.kind} route as static markup`, () => {
      const html = renderToStaticMarkup(
        friendlyMobileUtilityTheme.renderRoute(
          { shell, route },
          { skinId: "calm-blue", colors: SKIN_TOKENS["calm-blue"] },
        ),
      );

      expect(html).toContain(`data-route-kind="${route.kind}"`);
      expect(html).toContain(`<h1>${route.heading}</h1>`);
      expect(html).toContain('<main class="fmu-main"');
      expect(html).toContain(shell.footerText);
      expect(html).not.toMatch(/saved|bookmark|verification|popular|ranking|trending|저장|검증됨|인기|순위/i);
      if (route.kind === "home") {
        expect(html).toContain("생활 절차 안내");
        expect(html).toContain('<a aria-current="page" href="/">홈</a>');
      } else {
        expect(html).not.toContain('aria-current="page" href="/"');
      }
      if (route.kind === "article") {
        expect(html).toContain('href="#step">신청 단계</a>');
        expect(html).toContain("공식 절차 변경");
        expect(html).not.toMatch(/adsbygoogle|data-ad-|>광고</i);
      }
    });
  }

  it("places only declared slots on their matching eligible routes", () => {
    const adSlots = {
      "home-feed": <aside data-test-slot="home-feed">홈 슬롯</aside>,
      "article-after-summary": <aside data-test-slot="article-after-summary">요약 뒤 슬롯</aside>,
      "article-end": <aside data-test-slot="article-end">글 끝 슬롯</aside>,
      "desktop-sidebar": <aside data-test-slot="desktop-sidebar">미지원 슬롯</aside>,
    } as const;
    const render = (route: HtmlRouteViewModel) => renderToStaticMarkup(
      friendlyMobileUtilityTheme.renderRoute(
        { shell, route },
        { skinId: "calm-blue", colors: SKIN_TOKENS["calm-blue"], adSlots },
      ),
    );
    const home = routes.find((route) => route.kind === "home");
    const eligibleArticle = routes.find((route) => route.kind === "article");

    if (!home || !eligibleArticle || eligibleArticle.kind !== "article") {
      throw new Error("Friendly route fixtures are incomplete.");
    }

    const homeHtml = render(home);
    expect(homeHtml).toContain('data-test-slot="home-feed"');
    expect(homeHtml.indexOf('href="/article/guide"')).toBeLessThan(
      homeHtml.indexOf('data-test-slot="home-feed"'),
    );
    expect(homeHtml).not.toMatch(/data-test-slot="article-|data-test-slot="desktop-sidebar/);

    const articleHtml = render(eligibleArticle);
    expect(articleHtml).not.toContain('data-test-slot="home-feed"');
    expect(articleHtml).not.toContain('data-test-slot="desktop-sidebar"');
    expect(articleHtml.indexOf("이 글에서 확인할 내용")).toBeLessThan(
      articleHtml.indexOf('data-test-slot="article-after-summary"'),
    );
    expect(articleHtml.indexOf('data-test-slot="article-after-summary"')).toBeLessThan(
      articleHtml.indexOf("안내 정보"),
    );
    expect(articleHtml.indexOf("관련 안내")).toBeLessThan(
      articleHtml.indexOf('data-test-slot="article-end"'),
    );

    const ineligibleArticle = { ...eligibleArticle, advertisingEligible: false };
    expect(render(ineligibleArticle)).not.toContain("data-test-slot");
    for (const route of routes) {
      if (route.kind !== "home" && route.kind !== "article") {
        expect(render(route)).not.toContain("data-test-slot");
      }
    }
  });
});
