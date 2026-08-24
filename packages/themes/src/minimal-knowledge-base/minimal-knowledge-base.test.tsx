import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { HtmlRouteViewModel, ThemePageViewModel } from "../html-route-view-model.js";
import { HTML_ROUTE_KINDS } from "../html-route-view-model.js";
import type { ArticleListItemViewModel, SiteShellViewModel } from "../presentation-view-model.js";
import { SKIN_TOKENS } from "../skin.js";
import type { ThemeAdSlots } from "../theme-ad-slot.js";
import type { ThemeModule } from "../theme-module.js";
import { minimalKnowledgeBaseTheme } from "./index.js";

const shell: SiteShellViewModel = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 안내를 정리합니다.",
  primaryNavigation: [{ link: { href: "/guide", label: "안내" }, children: [
    { link: { href: "/guide/start", label: "시작" }, children: [] },
  ] }],
  footerText: "© 2026 생활메모",
};

const articleItem: ArticleListItemViewModel = {
  link: { href: "/article/start", label: "시작 안내" },
  summary: "글 요약",
  date: { kind: "published", dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
  estimatedReadingTime: { minutes: 2, label: "예상 읽기 시간 약 2분" },
  category: { href: "/category/life", label: "생활" },
  topics: ["신청"],
};

const recoveryLinks = [
  { kind: "search", href: "/search", label: "검색" },
  { kind: "category", href: "/category/life", label: "생활 안내" },
  { kind: "replacement", href: "/article/current", label: "최신 안내" },
] as const;

function base(path: string, heading: string) {
  return {
    path,
    heading,
    description: `${heading} 설명`,
    breadcrumbs: path === "/" ? [] : [
      { href: "/", label: "홈" }, { href: path, label: heading },
    ],
  };
}

const routes = [
  { ...base("/", "홈"), kind: "home", articleSectionHeading: "최근 안내", articles: [articleItem], categories: [{ href: "/category/life", label: "생활", description: "생활 안내 모음" }], searchLink: { href: "/search", label: "검색" }, aboutTeaser: { href: "/about", label: "운영 방식 보기", description: "한 명의 운영자가 공식 출처를 확인해 안내합니다." } },
  { ...base("/category/life", "생활"), kind: "category", articleSectionHeading: "최근 안내", articles: [articleItem], pagination: { currentPage: 1, pageCount: 1, previous: null, next: null }, topicSectionHeading: "관련 주제", topics: ["신청"] },
  { ...base("/article/start", "시작 안내"), kind: "article", category: articleItem.category, topics: ["정부24", "주민등록"], authorLabel: "작성자", operatorLabel: "운영자", published: articleItem.date, updated: { dateTime: "2026-08-25T00:00:00Z", label: "2026년 8월 25일" }, estimatedReadingTime: articleItem.estimatedReadingTime, trustLinks: [{ href: "/about", label: "운영 방식" }], toc: [{ id: "steps", label: "신청 단계", level: 2 }], sources: [{ label: "공식 출처", href: "https://example.org/source" }], updateTriggers: ["정책 변경"], faq: [{ question: "질문?", answer: "답변" }], relatedSectionHeading: "관련 안내", relatedArticles: [articleItem], advertisingEligible: false, readerActions: <button type="button">독자 기능</button>, hero: <figure>대표 이미지</figure>, body: <p>본문 슬롯</p> },
  { ...base("/about", "소개"), kind: "static-page", body: <p>정적 본문</p> },
  { ...base("/archive", "전체 글"), kind: "archive", articles: [articleItem], pagination: { currentPage: 1, pageCount: 1, previous: null, next: null } },
  { ...base("/search", "검색"), kind: "search", client: <form>검색 클라이언트</form> },
  { ...base("/404", "찾을 수 없음"), kind: "not-found", statusCode: 404, action: { href: "/", label: "홈" }, recoveryLinks },
  { ...base("/old", "제공 종료"), kind: "retired", statusCode: 410, action: { href: "/archive", label: "전체 글" }, recoveryLinks },
] satisfies readonly HtmlRouteViewModel[];

function render(route: HtmlRouteViewModel, adSlots?: ThemeAdSlots) {
  return renderToStaticMarkup(minimalKnowledgeBaseTheme.renderRoute(
    { shell, route }, {
      skinId: "calm-blue",
      colors: SKIN_TOKENS["calm-blue"],
      ...(adSlots ? { adSlots } : {}),
    },
  ));
}

function routeAt(index: number): HtmlRouteViewModel {
  const route = routes[index];
  if (!route) throw new Error(`Missing route fixture at index ${index}`);
  return route;
}

function getListRoute(kind: "archive" | "category") {
  const route = routes.find((candidate) => candidate.kind === kind);
  if (!route || (route.kind !== "archive" && route.kind !== "category")) {
    throw new Error(`Missing ${kind} fixture.`);
  }
  return route;
}

describe("Minimal Knowledge Base", () => {
  it("implements the exact module identity and complete route matrix", () => {
    expectTypeOf(minimalKnowledgeBaseTheme).toExtend<ThemeModule>();
    expectTypeOf<ThemePageViewModel>().toHaveProperty("route");
    expect(minimalKnowledgeBaseTheme.id).toBe("minimal-knowledge-base");
    expect(minimalKnowledgeBaseTheme.qualityExpectations.routeKinds).toBe(HTML_ROUTE_KINDS);
    expect(routes.map(({ kind }) => kind)).toEqual(HTML_ROUTE_KINDS);
    expect(minimalKnowledgeBaseTheme.supportedSlots).toEqual([
      "article-after-summary",
      "article-end",
    ]);
  });

  it.each(routes)("renders $kind through the complete KB shell", (route) => {
    const html = render(route);
    expect(html).toContain(`data-route="${route.kind}"`);
    expect(html).toContain(route.heading);
    expect(html).toContain('data-theme="minimal-knowledge-base"');
    expect(html).toContain('data-skin="calm-blue"');
    expect(html).toContain('<main id="main-content" tabindex="-1">');
  });

  it("orders the skip link, knowledge rail, main content, and footer", () => {
    const html = render(routeAt(0));
    const order = ["kb-skip-link", "kb-knowledge-rail", '<main id="main-content" tabindex="-1">', "kb-footer"];
    const positions = order.map((value) => html.indexOf(value));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('<nav aria-label="생활메모"><ul><li><a href="/guide">안내</a><ul>');
    expect(html).toContain("--color-canvas:#F6F8FC");
    expect(html).toContain("--color-surface:#FFFFFF");
    expect(html).toContain("--color-surface-muted:#EAF3FF");
    expect(html).toContain("--color-text:#13213A");
    expect(html).toContain("--color-text-muted:#65738B");
    expect(html).toContain("--color-primary:#245BCC");
    expect(html).toContain("--color-on-primary:#FFFFFF");
    expect(html).toContain("--color-border:#CBD8EB");
    expect(html).toContain("--color-success:#177245");
    expect(html).toContain("--color-warning:#8A4B08");
    expect(html).toContain("--color-danger:#B42318");
    expect(html).toContain("--focus-ring:#174AAD");
  });

  it("marks only the exact current knowledge rail navigation link", () => {
    const staticPage = routeAt(3);
    if (staticPage.kind !== "static-page") throw new Error("Expected static-page fixture");
    const html = render({
      ...staticPage,
      ...base("/guide/start", "시작"),
    });

    expect(html).toContain(
      '<a aria-current="page" href="/guide/start">시작</a>',
    );
    expect(html).toContain('<a href="/guide">안내</a>');
    expect(html).not.toContain(
      '<a aria-current="page" href="/guide">안내</a>',
    );
  });

  it("renders only a release-provided knowledge rail search entry", () => {
    const renderShell = (shellModel: SiteShellViewModel) =>
      renderToStaticMarkup(minimalKnowledgeBaseTheme.renderRoute(
        { shell: shellModel, route: routeAt(3) },
        { skinId: "calm-blue", colors: SKIN_TOKENS["calm-blue"] },
      ));
    const rail = (html: string) => html.match(
      /<aside class="kb-knowledge-rail">[\s\S]*?<\/aside>/,
    )?.[0];
    const withSearch = rail(renderShell({
      ...shell,
      searchLink: { href: "/search", label: "사이트 검색" },
    }));

    expect(withSearch).toContain(
      '<a class="kb-rail-search" href="/search">사이트 검색</a>',
    );
    expect(rail(renderShell(shell))).not.toContain("kb-rail-search");
    expect(rail(renderShell({ ...shell, searchLink: null }))).not.toContain(
      "kb-rail-search",
    );
  });

  it("keeps home and category knowledge sections in their intended order", () => {
    const home = render(routeAt(0));
    expect(home.indexOf("kb-home-search")).toBeLessThan(home.indexOf("kb-category-grid"));
    expect(home.indexOf("kb-category-grid")).toBeLessThan(home.indexOf("kb-latest-articles"));
    expect(home).toContain(
      '<section aria-labelledby="kb-home-categories-title" class="kb-category-grid"><h2 id="kb-home-categories-title">카테고리</h2>',
    );
    expect(home).toContain("생활 안내 모음");
    const category = render(routeAt(1));
    expect(category.indexOf("kb-category-scope")).toBeLessThan(category.indexOf("kb-category-articles"));
    expect(category.indexOf("kb-category-articles")).toBeLessThan(category.indexOf("kb-category-topics"));
  });

  it("renders one factual home introduction and omits absent variants", () => {
    const home = routeAt(0);
    if (home.kind !== "home") throw new Error("Expected home fixture");
    const html = render(home);
    const { aboutTeaser: _omitted, ...withoutTeaser } = home;

    expect(html.match(/<h2 id="home-about-teaser-heading">/g)).toHaveLength(1);
    expect(html).toContain("한 명의 운영자가 공식 출처를 확인해 안내합니다.");
    expect(html).toContain('<a href="/about">운영 방식 보기</a>');
    expect(html.indexOf("kb-latest-articles")).toBeLessThan(
      html.indexOf("home-about-teaser-heading"),
    );
    expect(render({ ...home, aboutTeaser: null })).not.toContain("home-about-teaser-heading");
    expect(render(withoutTeaser)).not.toContain("home-about-teaser-heading");
  });

  it.each(["category", "archive"] as const)(
    "omits pagination markup from a one-page %s list",
    (kind) => {
      expect(render(getListRoute(kind)))
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
      });

      expect(html.indexOf('href="/article/start"')).toBeLessThan(
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

  it("renders the complete answer-first article truth in order", () => {
    const article = routeAt(2);
    if (article.kind !== "article") throw new Error("Expected article fixture");
    const html = render(article);
    const facts = ["예상 읽기 시간 약 2분", "시작 안내 설명", "정부24", "주민등록", "이 안내의 정보", "신청 단계", "대표 이미지", "본문 슬롯", "공개 출처", "다시 확인하는 기준", "자주 묻는 질문", "관련 안내", "독자 기능"];
    const positions = facts.map((fact) => html.indexOf(fact));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(html).toContain('<span aria-current="page">시작 안내</span>');
    expect(html).toContain('<ul aria-label="관련 주제" class="theme-article-topics"><li>정부24</li><li>주민등록</li></ul>');
    expect(html.match(/aria-label="관련 주제"/g)).toHaveLength(1);
    expect(html).toContain('<li data-level="2"><a href="#steps">신청 단계</a></li>');
    expect(html.match(/<button type="button">독자 기능<\/button>/g)).toHaveLength(1);
    expect(html).not.toMatch(/data-ad|ad-slot/);

    const { topics: _topics, ...withoutTopics } = article;
    expect(render({ ...article, topics: [] })).not.toContain('aria-label="관련 주제"');
    expect(render(withoutTopics)).not.toContain('aria-label="관련 주제"');
  });

  it("preserves the existing article header when reading time is absent", () => {
    const article = routeAt(2);
    if (article.kind !== "article") throw new Error("Expected article fixture");
    const withoutReadingTime = Object.assign({}, article, {
      estimatedReadingTime: undefined,
    });
    const html = render(withoutReadingTime);
    const header = html.match(
      /<header class="kb-answer-first">[\s\S]*?<\/header>/,
    )?.[0];

    expect(withoutReadingTime).toHaveProperty("estimatedReadingTime", undefined);
    expect(header).not.toContain("kb-article-duration");
    expect(header).toContain(
      "<h1>시작 안내</h1><p>시작 안내 설명</p></header>",
    );
  });

  it("places only two separated article slots for eligible content", () => {
    const article = routeAt(2);
    if (article.kind !== "article") throw new Error("Expected article fixture");
    const adSlots: ThemeAdSlots = {
      "home-feed": <i data-test-slot="home-feed" />,
      "article-after-summary": <i data-test-slot="article-after-summary" />,
      "article-mid-1": <i data-test-slot="article-mid-1" />,
      "article-mid-2": <i data-test-slot="article-mid-2" />,
      "article-end": <i data-test-slot="article-end" />,
      "desktop-sidebar": <i data-test-slot="desktop-sidebar" />,
    };
    const eligible = { ...article, advertisingEligible: true };
    const html = render(eligible, adSlots);
    const positions = [
      "시작 안내 설명",
      'data-test-slot="article-after-summary"',
      "이 안내의 정보",
      "독자 기능",
      'data-test-slot="article-end"',
    ].map((value) => html.indexOf(value));

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));
    expect(html.match(/data-test-slot=/g)).toHaveLength(2);
    expect(html).not.toMatch(/data-test-slot="(?:home-feed|article-mid-[12]|desktop-sidebar)"/);
    expect(render(eligible)).not.toContain("data-test-slot");
    expect(render({ ...eligible, advertisingEligible: false }, adSlots))
      .not.toContain("data-test-slot");
    for (const route of routes.filter(({ kind }) => kind !== "article")) {
      expect(render(route, adSlots)).not.toContain("data-test-slot");
    }
  });

  it("renders static, archive, search, missing, and retired facts without invented claims", () => {
    const html = routes.slice(3).map((route) => render(route)).join("\n");
    expect(html).toContain("정적 본문");
    expect(html).toContain("시작 안내");
    expect(html).toContain("검색 클라이언트");
    expect(html).toContain(">404<");
    expect(html).toContain(">410<");
    expect(html).not.toMatch(/검증일|evergreen|popularity|ranking|저장|save/i);
  });

  it("renders ordered recovery paths once after each state route primary action", () => {
    for (const html of [render(routeAt(6)), render(routeAt(7))]) {
      const positions = [">검색</a>", ">생활 안내</a>", ">최신 안내</a>"]
        .map((value) => html.indexOf(value));
      const primaryAction = Math.max(html.indexOf(">홈</a>"), html.indexOf(">전체 글</a>"));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
      expect(primaryAction).toBeLessThan(positions[0] ?? -1);
      expect(html.match(/aria-label="페이지 복구 경로"/g)).toHaveLength(1);
      expect(html).not.toContain('href="/category"');
    }

    const withoutRecovery = render({
      ...base("/empty-404", "복구 경로 없음"), kind: "not-found", statusCode: 404,
      action: { href: "/", label: "홈" }, recoveryLinks: [],
    });
    expect(withoutRecovery).not.toContain("페이지 복구 경로");
  });
});
