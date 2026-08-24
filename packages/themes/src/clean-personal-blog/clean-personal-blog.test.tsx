import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import { HTML_ROUTE_KINDS, type HtmlRouteViewModel } from "../html-route-view-model.js";
import type { ArticleListItemViewModel, SiteShellViewModel } from "../presentation-view-model.js";
import { SKIN_IDS, SKIN_TOKENS, type SkinId } from "../skin.js";
import type { ThemeModule } from "../theme-module.js";
import type { ThemeAdSlots } from "../theme-ad-slot.js";
import { cleanPersonalBlogTheme } from "./module.js";

const shell: SiteShellViewModel = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "한 사람이 정리하는 실생활 안내",
  primaryNavigation: [{ link: { href: "/archive", label: "전체 글" }, children: [] }],
  footerText: "© 2026 생활메모",
};
const item: ArticleListItemViewModel = {
  link: { href: "/article/guide", label: "안내 글" },
  summary: "안내 요약",
  date: { kind: "published", dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
  estimatedReadingTime: { minutes: 2, label: "예상 읽기 시간 약 2분" },
  category: { href: "/category/life", label: "생활" },
  topics: ["신청"],
};
function base(path: string, heading: string) {
  return { path, heading, description: `${heading} 설명`, breadcrumbs: path === "/" ? [] : [
    { href: "/", label: "홈" }, { href: path, label: heading },
  ] };
}
const routes = [
  { ...base("/", "홈"), kind: "home", articleSectionHeading: "최근 글", articles: [item], categories: [{ href: "/category/life", label: "생활", description: "생활 안내 모음" }], searchLink: { href: "/search", label: "사이트 검색" } },
  { ...base("/category/life", "생활"), kind: "category", articleSectionHeading: "최근 글", articles: [item], pagination: { currentPage: 1, pageCount: 1, previous: null, next: null }, topicSectionHeading: "관련 주제", topics: ["신청"] },
  { ...base("/article/guide", "안내 글"), kind: "article", category: item.category, topics: ["신청", "생활 행정"], authorLabel: "작성자", operatorLabel: "운영자", published: item.date, updated: { dateTime: "2026-08-25T00:00:00Z", label: "2026년 8월 25일" }, estimatedReadingTime: item.estimatedReadingTime, trustLinks: [{ href: "/about", label: "운영 방식" }], toc: [{ id: "steps", label: "신청 단계", level: 2 }], sources: [{ label: "공식 출처", href: "https://example.org/source" }], updateTriggers: ["절차 변경"], faq: [{ question: "질문?", answer: "답변" }], relatedSectionHeading: "관련 글", relatedArticles: [item], advertisingEligible: true, readerActions: <button type="button">현재 글 저장</button>, hero: <figure>대표 이미지</figure>, body: <div><h2 id="steps">신청 단계</h2><p>본문</p></div> },
  { ...base("/about", "소개"), kind: "static-page", body: <p>소개 본문</p> },
  { ...base("/archive", "전체 글"), kind: "archive", articles: [item], pagination: { currentPage: 1, pageCount: 1, previous: null, next: null } },
  { ...base("/search", "검색"), kind: "search", client: <form>검색 폼</form> },
  { ...base("/404", "찾을 수 없음"), kind: "not-found", statusCode: 404, action: { href: "/", label: "홈" } },
  { ...base("/old", "제공 종료"), kind: "retired", statusCode: 410, action: { href: "/archive", label: "전체 글" } },
] satisfies readonly HtmlRouteViewModel[];
const markers: Readonly<Record<HtmlRouteViewModel["kind"], string>> = {
  home: "생활 안내 모음", category: "관련 주제", article: "본문",
  "static-page": "소개 본문", archive: "안내 글", search: "검색 폼",
  "not-found": ">404<", retired: ">410<",
};
function render(route: HtmlRouteViewModel, skinId: SkinId, adSlots?: ThemeAdSlots) {
  return renderToStaticMarkup(cleanPersonalBlogTheme.renderRoute(
    { shell, route }, {
      skinId,
      colors: SKIN_TOKENS[skinId],
      ...(adSlots ? { adSlots } : {}),
    },
  ));
}
function getListRoute(kind: "archive" | "category") {
  const route = routes.find((candidate) => candidate.kind === kind);
  if (!route || (route.kind !== "archive" && route.kind !== "category")) {
    throw new Error(`Missing ${kind} fixture.`);
  }
  return route;
}
const matrix = SKIN_IDS.flatMap((skinId) => routes.map((route) => ({ route, skinId })));

describe("Clean Personal Blog", () => {
  it("declares its exact identity and full route capability", () => {
    expectTypeOf(cleanPersonalBlogTheme).toExtend<ThemeModule>();
    expect(cleanPersonalBlogTheme.id).toBe("clean-personal-blog");
    expect(cleanPersonalBlogTheme.qualityExpectations).toEqual({ routeKinds: HTML_ROUTE_KINDS, density: "spacious", articleMeasure: "narrow" });
    expect(cleanPersonalBlogTheme.supportedSlots).toEqual([
      "home-feed", "article-after-summary", "article-end",
    ]);
    expect(routes.map(({ kind }) => kind)).toEqual(HTML_ROUTE_KINDS);
  });

  it.each(matrix)("renders $route.kind with $skinId", ({ route, skinId }) => {
    const html = render(route, skinId);
    expect(html).toContain('data-theme="clean-personal-blog"');
    expect(html).toContain(`data-skin="${skinId}"`);
    expect(html).toContain(`data-route="${route.kind}"`);
    expect(html).toContain(markers[route.kind]);
    expect(html).toContain('id="main-content" tabindex="-1"');
    for (const color of Object.values(SKIN_TOKENS[skinId])) expect(html).toContain(color);
    expect(html).not.toMatch(/author bio|email|social|popular|newsletter|save|data-ad|ad-slot/i);
  });

  it("uses a concise masthead and roomy single-column reading shell", () => {
    const html = render(routes[0]!, "warm-neutral");
    expect(html).toContain('class="personal-masthead"');
    expect(html).toContain('class="personal-reading-column"');
    expect(html.indexOf("personal-title")).toBeLessThan(html.indexOf("personal-nav"));
    expect(html).toContain("한 사람이 정리하는 실생활 안내");
  });

  it("marks only the exact current masthead navigation link", () => {
    const archive = render(routes[4]!, "warm-neutral");
    const article = render(routes[2]!, "warm-neutral");

    expect(archive).toContain(
      '<a aria-current="page" href="/archive">전체 글</a>',
    );
    expect(article).toContain('<a href="/archive">전체 글</a>');
    expect(article).not.toContain(
      '<a aria-current="page" href="/archive">전체 글</a>',
    );
  });

  it("renders only a release-provided masthead search entry", () => {
    const renderShell = (shellModel: SiteShellViewModel) =>
      renderToStaticMarkup(
        cleanPersonalBlogTheme.renderRoute(
          { shell: shellModel, route: routes[3]! },
          { skinId: "warm-neutral", colors: SKIN_TOKENS["warm-neutral"] },
        ),
      );
    const masthead = (html: string) => html.match(
      /<header class="personal-masthead">[\s\S]*?<\/header>/,
    )?.[0];
    const withSearch = masthead(renderShell({
      ...shell,
      searchLink: { href: "/search", label: "사이트 검색" },
    }));

    expect(withSearch).toContain(
      '<a class="personal-masthead-search" href="/search">사이트 검색</a>',
    );
    expect(masthead(renderShell(shell))).not.toContain(
      "personal-masthead-search",
    );
    expect(masthead(renderShell({ ...shell, searchLink: null }))).not.toContain(
      "personal-masthead-search",
    );
  });

  it("renders a supplied about teaser once and omits absent data", () => {
    const home = routes[0]!;
    if (home.kind !== "home") throw new Error("home fixture is missing");
    const html = render({
      ...home,
      aboutTeaser: {
        href: "/about",
        label: "소개",
        description: "한 명의 운영자가 확인한 생활 정보를 정리합니다.",
      },
    }, "warm-neutral");

    expect(html.match(/id="home-about-teaser-heading"/g)).toHaveLength(1);
    expect(html).toContain("한 명의 운영자가 확인한 생활 정보를 정리합니다.");
    expect(html).toContain('href="/about">소개</a>');
    expect(render(home, "warm-neutral")).not.toContain(
      "home-about-teaser-heading",
    );
  });

  it.each(["category", "archive"] as const)(
    "omits pagination markup from a one-page %s list",
    (kind) => {
      expect(render(getListRoute(kind), "warm-neutral"))
        .not.toContain('aria-label="목록 페이지 이동"');
    },
  );

  it.each([
    ["category", "/category/life/page/2", "/category/life", "/category/life/page/3"],
    ["archive", "/archive/page/2", "/archive", "/archive/page/3"],
  ] as const)(
    "renders real pagination anchors after the %s article list",
    (kind, path, previousHref, nextHref) => {
      const route = getListRoute(kind);
      const html = render({
        ...route,
        path,
        breadcrumbs: [{ href: path, label: route.heading }],
        pagination: {
          currentPage: 2,
          pageCount: 3,
          previous: { href: previousHref, label: "이전 페이지" },
          next: { href: nextHref, label: "다음 페이지" },
        },
      }, "warm-neutral");

      expect(html.indexOf('href="/article/guide"')).toBeLessThan(
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

  it("preserves article trust, TOC, evidence, and related facts", () => {
    const html = render(routes[2]!, "forest-green");
    const facts = ["안내 글 설명", "예상 읽기 시간 약 2분", "이 글의 정보", "대표 이미지", "목차", "본문", "공개 출처", "다시 확인하는 기준", "자주 묻는 질문", "관련 글"];
    expect(facts.every((fact) => html.includes(fact))).toBe(true);
    expect(html).toContain('<a href="#steps">신청 단계</a>');
    expect(html).toContain("운영 방식");
    expect(html).toContain(
      '<ul aria-label="관련 주제" class="theme-article-topics"><li>신청</li><li>생활 행정</li></ul>',
    );
    expect(html).not.toMatch(/href="\/tag\//);
    expect(html).toContain('<section aria-labelledby="personal-reader-actions-title"');
    expect(html.match(/현재 글 저장/g)).toHaveLength(1);
    expect(html.indexOf("자주 묻는 질문")).toBeLessThan(html.indexOf("글 읽기 도구"));
    expect(html.indexOf("글 읽기 도구")).toBeLessThan(html.indexOf("관련 글"));
    expect(html).not.toMatch(/data-ad|ad-slot|광고 영역/);
  });

  it("preserves the existing article header when reading time is absent", () => {
    const article = routes[2]!;
    if (article.kind !== "article") throw new Error("article fixture is missing");
    const withoutReadingTime = Object.assign({}, article, {
      estimatedReadingTime: undefined,
    });
    const html = render(withoutReadingTime, "warm-neutral");
    const header = html.match(
      /<header class="personal-article-header">[\s\S]*?<\/header>/,
    )?.[0];

    expect(withoutReadingTime).toHaveProperty("estimatedReadingTime", undefined);
    expect(header).not.toContain("personal-article-reading-time");
    expect(header).toContain("<h1>안내 글</h1>");
    expect(header).toContain('<p class="personal-article-summary">안내 글 설명</p>');
  });

  it("places only its three manual slots at eligible reading boundaries", () => {
    const adSlots: ThemeAdSlots = {
      "home-feed": <i data-test-slot="home-feed">홈</i>,
      "article-after-summary": <i data-test-slot="article-after-summary">요약 뒤</i>,
      "article-mid-1": <i data-test-slot="article-mid-1">본문 중간</i>,
      "article-mid-2": <i data-test-slot="article-mid-2">본문 중간 둘</i>,
      "article-end": <i data-test-slot="article-end">글 끝</i>,
      "desktop-sidebar": <i data-test-slot="desktop-sidebar">보조 칸</i>,
    };
    const homeHtml = render(routes[0]!, "warm-neutral", adSlots);
    expect(homeHtml.match(/data-test-slot=/g)).toHaveLength(1);
    expect(homeHtml.indexOf("안내 요약")).toBeLessThan(
      homeHtml.indexOf('data-test-slot="home-feed"'),
    );

    const article = routes[2]!;
    if (article.kind !== "article") throw new Error("article fixture is missing");
    const articleHtml = render(article, "warm-neutral", adSlots);
    const order = [
      "안내 글 설명", 'data-test-slot="article-after-summary"',
      "이 글의 정보", "관련 글", 'data-test-slot="article-end"',
    ].map((marker) => articleHtml.indexOf(marker));
    expect(order.every((position) => position >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((left, right) => left - right));
    expect(articleHtml.match(/data-test-slot=/g)).toHaveLength(2);
    expect(render({ ...article, advertisingEligible: false }, "warm-neutral", adSlots))
      .not.toContain("data-test-slot");
    for (const route of routes.slice(1).filter(({ kind }) => kind !== "article")) {
      expect(render(route, "warm-neutral", adSlots)).not.toContain("data-test-slot");
    }
  });

  it.each([null, undefined])("omits reader actions for %s", (readerActions) => {
    const article = routes[2]!;
    if (article.kind !== "article") throw new Error("article fixture is missing");
    const html = render({ ...article, readerActions }, "warm-neutral");

    expect(html).not.toContain("personal-reader-actions-title");
    expect(html).not.toContain("현재 글 저장");
  });

  it("renders ordered status recovery once after the primary action", () => {
    const missing = routes[6]!;
    if (missing.kind !== "not-found") throw new Error("missing fixture is incomplete");
    const html = render({
      ...missing,
      recoveryLinks: [
        { href: "/search", label: "검색", kind: "search" },
        { href: "/category/life", label: "생활", kind: "category" },
        { href: "/article/guide", label: "현재 안내", kind: "replacement" },
      ],
    }, "warm-neutral");
    const hrefs = ["/", "/search", "/category/life", "/article/guide"];
    const positions = hrefs.map((href) => html.indexOf(`href="${href}"`));

    expect(html.match(/aria-label="페이지 복구 경로"/g)).toHaveLength(1);
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).not.toContain('href="/category"');
  });

  it.each([routes[6]!, routes[7]!])("omits empty $kind recovery", (route) => {
    expect(render(route, "forest-green")).not.toContain('aria-label="페이지 복구 경로"');
  });
});
