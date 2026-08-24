import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { HtmlRouteViewModel } from "../html-route-view-model.js";
import type {
  ArticleListItemViewModel,
  SiteShellViewModel,
} from "../presentation-view-model.js";
import { SKIN_IDS, SKIN_TOKENS } from "../skin.js";
import { informationPortalTheme } from "./module.js";

const shell: SiteShellViewModel = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 정보를 정리합니다.",
  primaryNavigation: [{ link: { href: "/", label: "홈" }, children: [] }],
  footerText: "© 2026 생활메모",
};
const item: ArticleListItemViewModel = {
  link: { href: "/article/guide", label: "생활 안내" },
  summary: "필요한 절차",
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
    ...base("/", "홈"), kind: "home", articleSectionHeading: "최근 안내", articles: [item],
    categories: [{ href: "/category/life", label: "생활", description: "생활 절차 안내" }],
    searchLink: { href: "/search", label: "사이트 검색" },
  },
  {
    ...base("/category/life", "생활"), kind: "category", articleSectionHeading: "최근 안내",
    articles: [item], topicSectionHeading: "관련 주제", topics: ["신청"],
  },
  {
    ...base("/article/guide", "생활 안내"), kind: "article",
    category: { href: "/category/life", label: "생활" }, authorLabel: "작성자", operatorLabel: "운영자",
    published: { dateTime: "2026-08-20T00:00:00Z", label: "2026년 8월 20일" }, updated: null,
    trustLinks: [], toc: [{ id: "step", label: "신청 단계", level: 2 }], sources: [],
    updateTriggers: [], faq: [], relatedSectionHeading: "관련 안내", relatedArticles: [item],
    advertisingEligible: true, hero: null, body: <section id="step">신청 본문</section>,
  },
  { ...base("/about", "소개"), kind: "static-page", body: <p>운영 원칙</p> },
  { ...base("/archive", "전체 글"), kind: "archive", articles: [item] },
  { ...base("/search", "검색"), kind: "search", client: <form>검색 폼</form> },
  { ...base("/404", "찾을 수 없음"), kind: "not-found", statusCode: 404, action: { href: "/", label: "홈으로" } },
  { ...base("/retired", "종료된 안내"), kind: "retired", statusCode: 410, action: { href: "/archive", label: "전체 글" } },
];

describe("Information Portal route and skin matrix", () => {
  it("covers the exact declared route and skin sets", () => {
    expect(routes.map(({ kind }) => kind)).toEqual(
      informationPortalTheme.qualityExpectations.routeKinds,
    );
    expect(SKIN_IDS).toEqual(["calm-blue", "forest-green", "warm-neutral"]);
  });

  for (const route of routes) {
    for (const skinId of SKIN_IDS) {
      it(`renders ${route.kind} with ${skinId}`, () => {
        const html = renderToStaticMarkup(
          informationPortalTheme.renderRoute(
            { shell, route },
            { skinId, colors: SKIN_TOKENS[skinId] },
          ),
        );

        expect(html).toContain('data-theme="information-portal"');
        expect(html).toContain(`data-skin="${skinId}"`);
        expect(html).toContain(`data-route-kind="${route.kind}"`);
        expect(html).toContain(`<h1>${route.heading}</h1>`);
        expect(html).toContain('<main class="ip-main"');
        expect(html).not.toMatch(/ranking|trending|popular|count|verified|newsletter|bookmark|saved|순위|인기|조회|검증됨|뉴스레터|저장/i);
        if (route.kind === "article") expect(html).not.toMatch(/adsbygoogle|data-ad-|>광고</i);
      });
    }
  }

  it("places only the four declared manual slots on eligible routes", () => {
    const adSlots = {
      "home-feed": <div data-slot="home-feed" />,
      "article-after-summary": <div data-slot="article-after-summary" />,
      "article-mid-1": <div data-slot="article-mid-1" />,
      "article-end": <div data-slot="article-end" />,
      "desktop-sidebar": <div data-slot="desktop-sidebar" />,
    } as const;
    const context = {
      skinId: "calm-blue" as const,
      colors: SKIN_TOKENS["calm-blue"],
      adSlots,
    };
    const home = renderToStaticMarkup(
      informationPortalTheme.renderRoute({ shell, route: routes[0]! }, context),
    );
    const article = renderToStaticMarkup(
      informationPortalTheme.renderRoute({ shell, route: routes[2]! }, context),
    );

    expect(home.match(/data-slot=/g)).toHaveLength(1);
    expect(home).toContain('data-slot="home-feed"');
    expect(home.indexOf("생활 안내")).toBeLessThan(home.indexOf('data-slot="home-feed"'));
    expect(article.match(/data-slot=/g)).toHaveLength(3);
    expect(article.indexOf('id="ip-summary"')).toBeLessThan(
      article.indexOf('data-slot="article-after-summary"'),
    );
    expect(article).toMatch(
      /<aside aria-label="글 탐색과 안내 정보"[^>]*>[\s\S]*data-slot="desktop-sidebar"[\s\S]*<\/aside>/,
    );
    expect(article.indexOf("관련 안내")).toBeLessThan(
      article.indexOf('data-slot="article-end"'),
    );
    expect(`${home}${article}`).not.toContain('data-slot="article-mid-1"');
    for (const route of routes.filter(
      ({ kind }) => kind !== "home" && kind !== "article",
    )) {
      expect(renderToStaticMarkup(
        informationPortalTheme.renderRoute({ shell, route }, context),
      )).not.toContain("data-slot=");
    }
  });

  it("omits article slots when the article is not advertising eligible", () => {
    const article = routes[2]!;
    if (article.kind !== "article") throw new Error("Expected article fixture");
    const html = renderToStaticMarkup(
      informationPortalTheme.renderRoute(
        { shell, route: { ...article, advertisingEligible: false } },
        {
          skinId: "calm-blue",
          colors: SKIN_TOKENS["calm-blue"],
          adSlots: {
            "article-after-summary": <div data-slot="summary" />,
            "article-end": <div data-slot="end" />,
            "desktop-sidebar": <div data-slot="sidebar" />,
          },
        },
      ),
    );

    expect(html).not.toContain("data-slot=");
  });
});
