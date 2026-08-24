import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  HTML_ROUTE_KINDS,
  type HtmlRouteViewModel,
} from "../html-route-view-model.js";
import type {
  ArticleListItemViewModel,
  SiteShellViewModel,
} from "../presentation-view-model.js";
import { SKIN_IDS, SKIN_TOKENS, type SkinId } from "../skin.js";
import type { ThemeAdSlots } from "../theme-ad-slot.js";
import { AD_SLOT_IDS, type ThemeModule } from "../theme-module.js";
import { editorialUtilityTheme } from "./module.js";

const shell: SiteShellViewModel = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 안내를 차분하게 정리합니다.",
  primaryNavigation: [
    { link: { href: "/category/life", label: "생활" }, children: [] },
    { link: { href: "/archive", label: "전체 글" }, children: [] },
  ],
  footerText: "© 2026 생활메모",
};

const articles: readonly ArticleListItemViewModel[] = Array.from(
  { length: 4 },
  (_, index) => ({
    link: { href: `/article/${index + 1}`, label: `안내 ${index + 1}` },
    summary: `안내 ${index + 1} 요약`,
    date: { dateTime: `2026-08-2${index + 1}T00:00:00Z`, label: `2026년 8월 2${index + 1}일` },
    category: { href: "/category/life", label: "생활" },
    topics: ["신청"],
  }),
);

function base(path: string, heading: string) {
  return {
    path,
    heading,
    description: `${heading} 설명`,
    breadcrumbs: path === "/" ? [] : [
      { href: "/", label: "홈" },
      { href: path, label: heading },
    ],
  };
}

const routes = [
  { ...base("/", "홈"), kind: "home", articleSectionHeading: "최근 안내", articles, categories: [{ href: "/category/life", label: "생활", description: "생활 절차 안내" }], searchLink: { href: "/search", label: "사이트 검색" } },
  { ...base("/category/life", "생활"), kind: "category", articleSectionHeading: "최근 안내", articles, topicSectionHeading: "관련 주제", topics: ["신청"] },
  { ...base("/article/1", "기사 제목"), kind: "article", category: { href: "/category/life", label: "생활" }, authorLabel: "작성자", operatorLabel: "운영자", published: articles[0]!.date, updated: { dateTime: "2026-08-25T00:00:00Z", label: "2026년 8월 25일" }, trustLinks: [{ href: "/about", label: "운영 방식" }], toc: [{ id: "steps", label: "신청 단계", level: 2 }], sources: [{ label: "기관 원문", href: "https://example.org/source" }, { label: "보충 자료", href: null }], updateTriggers: ["정책 변경"], faq: [{ question: "질문?", answer: "답변" }], relatedSectionHeading: "함께 읽을 안내", relatedArticles: [articles[1]!], advertisingEligible: true, hero: <figure><figcaption>대표 이미지</figcaption></figure>, body: <div><h2 id="steps">신청 단계</h2><p>본문 슬롯</p></div> },
  { ...base("/about", "소개"), kind: "static-page", body: <p>정적 본문</p> },
  { ...base("/archive", "전체 글"), kind: "archive", articles },
  { ...base("/search", "검색"), kind: "search", client: <form><label htmlFor="q">검색어</label><input id="q" /></form> },
  { ...base("/404", "찾을 수 없음"), kind: "not-found", statusCode: 404, action: { href: "/", label: "홈으로" } },
  { ...base("/old", "제공 종료"), kind: "retired", statusCode: 410, action: { href: "/archive", label: "전체 글" } },
] satisfies readonly HtmlRouteViewModel[];

const markers: Readonly<Record<HtmlRouteViewModel["kind"], string>> = {
  home: "안내 1",
  category: "관련 주제",
  article: "본문 슬롯",
  "static-page": "정적 본문",
  archive: "전체 글 설명",
  search: "검색어",
  "not-found": ">404<",
  retired: ">410<",
};

function render(
  route: HtmlRouteViewModel,
  skinId: SkinId = "calm-blue",
  adSlots?: ThemeAdSlots,
) {
  return renderToStaticMarkup(
    editorialUtilityTheme.renderRoute(
      { shell, route },
      {
        skinId,
        colors: SKIN_TOKENS[skinId],
        ...(adSlots ? { adSlots } : {}),
      },
    ),
  );
}

const matrix = SKIN_IDS.flatMap((skinId) =>
  routes.map((route) => ({ route, skinId })),
);

describe("Editorial Utility", () => {
  it("declares the exact module identity and complete route capability", () => {
    expectTypeOf(editorialUtilityTheme).toExtend<ThemeModule>();
    expect(editorialUtilityTheme.id).toBe("editorial-utility");
    expect(editorialUtilityTheme.qualityExpectations).toEqual({
      routeKinds: HTML_ROUTE_KINDS,
      density: "balanced",
      articleMeasure: "narrow",
    });
    expect(editorialUtilityTheme.supportedSlots).toBe(AD_SLOT_IDS);
    expect(routes.map(({ kind }) => kind)).toEqual(HTML_ROUTE_KINDS);
  });

  it.each(matrix)("renders $route.kind with $skinId", ({ route, skinId }) => {
    const html = render(route, skinId);
    expect(html).toContain('data-theme="editorial-utility"');
    expect(html).toContain(`data-skin="${skinId}"`);
    expect(html).toContain(`data-route="${route.kind}"`);
    expect(html).toContain('id="main-content"');
    expect(html).toContain(markers[route.kind]);
    expect(html).toContain(shell.footerText);
    for (const color of Object.values(SKIN_TOKENS[skinId])) {
      expect(html).toContain(color);
    }
    expect(html).not.toMatch(/읽는 시간|reading time|저장|save|뉴스레터|newsletter|popular|evergreen|popularity|ranking/i);
  });

  it("uses the first actual article as lead, then secondary and latest groups", () => {
    const html = render(routes[0]!);
    const lead = html.match(/<section class="editorial-home-lead"[\s\S]*?<\/section>/)?.[0];
    const secondary = html.match(/<section class="editorial-home-secondary editorial-section"[\s\S]*?<\/section>/)?.[0];
    const latest = html.match(/<section class="editorial-latest editorial-section"[\s\S]*?<\/section>/)?.[0];
    expect(lead).toContain("안내 1");
    expect(lead).not.toContain("안내 2");
    expect(secondary).toContain("안내 2");
    expect(secondary).toContain("안내 3");
    expect(latest).toContain("안내 4");
    expect(html).toContain("생활 절차 안내");
    expect(html).toContain('href="/search">사이트 검색</a>');
  });

  it("renders the generous article truth, evidence rail, TOC, and narrow body", () => {
    const html = render(routes[2]!);
    const facts = ["기사 제목", "기사 제목 설명", "대표 이미지", "이 안내의 정보", "목차", "기관 원문", "정책 변경", "본문 슬롯", "자주 묻는 질문", "함께 읽을 안내"];
    const positions = facts.map((fact) => html.indexOf(fact));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(html).toContain('<a href="#steps">신청 단계</a>');
    expect(html).toContain('class="editorial-body"');
    expect(html).toContain('class="editorial-evidence"');
    expect(html).not.toMatch(/data-ad|ad-slot|광고 영역/);
  });

  it("renders supplied reader actions once near the article end", () => {
    const article = routes[2]!;
    if (article.kind !== "article") throw new Error("Expected article fixture");
    const html = render(
      { ...article, readerActions: <button data-reader-action="bookmark">저장</button> },
      "calm-blue",
      { "article-end": <i data-test-slot="article-end">글 끝</i> },
    );
    expect(html.match(/data-reader-action=/g)).toHaveLength(1);
    expect(html).toContain('aria-label="글 읽기 도구"');
    expect(html.indexOf("함께 읽을 안내")).toBeLessThan(html.indexOf("글 읽기 도구"));
    expect(html.indexOf("글 읽기 도구")).toBeLessThan(
      html.indexOf('data-test-slot="article-end"'),
    );
    expect(render(article)).not.toContain("글 읽기 도구");
    expect(render({ ...article, readerActions: null })).not.toContain("글 읽기 도구");
  });

  it("places all six manual slots only at their matching eligible boundaries", () => {
    const adSlots: ThemeAdSlots = {
      "home-feed": <i data-test-slot="home-feed">홈</i>,
      "article-after-summary": <i data-test-slot="article-after-summary">소개 뒤</i>,
      "article-mid-1": <i data-test-slot="article-mid-1">중간 하나</i>,
      "article-mid-2": <i data-test-slot="article-mid-2">중간 둘</i>,
      "article-end": <i data-test-slot="article-end">글 끝</i>,
      "desktop-sidebar": <i data-test-slot="desktop-sidebar">보조 칸</i>,
    };
    const homeHtml = render(routes[0]!, "calm-blue", adSlots);
    expect(homeHtml).toContain('data-test-slot="home-feed"');
    expect(homeHtml.indexOf("안내 4 요약")).toBeLessThan(
      homeHtml.indexOf('data-test-slot="home-feed"'),
    );
    expect(homeHtml.match(/data-test-slot=/g)).toHaveLength(1);

    const eligibleArticle = routes[2]!;
    if (eligibleArticle.kind !== "article") {
      throw new Error("Editorial article fixture is missing.");
    }
    const articleHtml = render(eligibleArticle, "calm-blue", adSlots);
    expect(articleHtml).not.toContain('data-test-slot="home-feed"');
    for (const slotId of AD_SLOT_IDS.slice(1)) {
      expect(articleHtml.match(new RegExp(`data-test-slot="${slotId}"`, "g"))).toHaveLength(1);
    }
    const orderedFacts = [
      "기사 제목 설명",
      'data-test-slot="article-after-summary"',
      "대표 이미지",
      'data-test-slot="article-mid-1"',
      "정책 변경",
      'data-test-slot="desktop-sidebar"',
      "본문 슬롯",
      'data-test-slot="article-mid-2"',
      "함께 읽을 안내",
      'data-test-slot="article-end"',
    ];
    const positions = orderedFacts.map((fact) => articleHtml.indexOf(fact));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));

    expect(render(
      { ...eligibleArticle, advertisingEligible: false },
      "calm-blue",
      adSlots,
    )).not.toContain("data-test-slot");
    for (const route of routes) {
      if (route.kind !== "home" && route.kind !== "article") {
        expect(render(route, "calm-blue", adSlots)).not.toContain("data-test-slot");
      }
    }
  });

  it("renders static, archive, search, missing, and retired public facts", () => {
    const html = routes.slice(3).map((route) => render(route)).join("\n");
    expect(html).toContain("정적 본문");
    expect(html).toContain("<ol>");
    expect(html).toContain("<form>");
    expect(html).toContain(">404<");
    expect(html).toContain(">410<");
  });
});
