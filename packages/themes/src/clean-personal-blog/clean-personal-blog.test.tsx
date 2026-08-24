import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import { HTML_ROUTE_KINDS, type HtmlRouteViewModel } from "../html-route-view-model.js";
import type { ArticleListItemViewModel, SiteShellViewModel } from "../presentation-view-model.js";
import { SKIN_IDS, SKIN_TOKENS, type SkinId } from "../skin.js";
import type { ThemeModule } from "../theme-module.js";
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
  date: { dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
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
  { ...base("/category/life", "생활"), kind: "category", articleSectionHeading: "최근 글", articles: [item], topicSectionHeading: "관련 주제", topics: ["신청"] },
  { ...base("/article/guide", "안내 글"), kind: "article", category: item.category, authorLabel: "작성자", operatorLabel: "운영자", published: item.date, updated: { dateTime: "2026-08-25T00:00:00Z", label: "2026년 8월 25일" }, trustLinks: [{ href: "/about", label: "운영 방식" }], toc: [{ id: "steps", label: "신청 단계", level: 2 }], sources: [{ label: "공식 출처", href: "https://example.org/source" }], updateTriggers: ["절차 변경"], faq: [{ question: "질문?", answer: "답변" }], relatedSectionHeading: "관련 글", relatedArticles: [item], advertisingEligible: true, readerActions: <button type="button">현재 글 저장</button>, hero: <figure>대표 이미지</figure>, body: <div><h2 id="steps">신청 단계</h2><p>본문</p></div> },
  { ...base("/about", "소개"), kind: "static-page", body: <p>소개 본문</p> },
  { ...base("/archive", "전체 글"), kind: "archive", articles: [item] },
  { ...base("/search", "검색"), kind: "search", client: <form>검색 폼</form> },
  { ...base("/404", "찾을 수 없음"), kind: "not-found", statusCode: 404, action: { href: "/", label: "홈" } },
  { ...base("/old", "제공 종료"), kind: "retired", statusCode: 410, action: { href: "/archive", label: "전체 글" } },
] satisfies readonly HtmlRouteViewModel[];
const markers: Readonly<Record<HtmlRouteViewModel["kind"], string>> = {
  home: "생활 안내 모음", category: "관련 주제", article: "본문",
  "static-page": "소개 본문", archive: "안내 글", search: "검색 폼",
  "not-found": ">404<", retired: ">410<",
};
function render(route: HtmlRouteViewModel, skinId: SkinId) {
  return renderToStaticMarkup(cleanPersonalBlogTheme.renderRoute(
    { shell, route }, { skinId, colors: SKIN_TOKENS[skinId] },
  ));
}
const matrix = SKIN_IDS.flatMap((skinId) => routes.map((route) => ({ route, skinId })));

describe("Clean Personal Blog", () => {
  it("declares its exact identity and full route capability", () => {
    expectTypeOf(cleanPersonalBlogTheme).toExtend<ThemeModule>();
    expect(cleanPersonalBlogTheme.id).toBe("clean-personal-blog");
    expect(cleanPersonalBlogTheme.qualityExpectations).toEqual({ routeKinds: HTML_ROUTE_KINDS, density: "spacious", articleMeasure: "narrow" });
    expect(cleanPersonalBlogTheme.supportedSlots).toEqual([]);
    expect(routes.map(({ kind }) => kind)).toEqual(HTML_ROUTE_KINDS);
  });

  it.each(matrix)("renders $route.kind with $skinId", ({ route, skinId }) => {
    const html = render(route, skinId);
    expect(html).toContain('data-theme="clean-personal-blog"');
    expect(html).toContain(`data-skin="${skinId}"`);
    expect(html).toContain(`data-route="${route.kind}"`);
    expect(html).toContain(markers[route.kind]);
    expect(html).toContain('id="main-content"');
    for (const color of Object.values(SKIN_TOKENS[skinId])) expect(html).toContain(color);
    expect(html).not.toMatch(/author bio|email|social|reading.?time|popular|newsletter|save|data-ad|ad-slot/i);
  });

  it("uses a concise masthead and roomy single-column reading shell", () => {
    const html = render(routes[0]!, "warm-neutral");
    expect(html).toContain('class="personal-masthead"');
    expect(html).toContain('class="personal-reading-column"');
    expect(html.indexOf("personal-title")).toBeLessThan(html.indexOf("personal-nav"));
    expect(html).toContain("한 사람이 정리하는 실생활 안내");
  });

  it("preserves article trust, TOC, evidence, and related facts", () => {
    const html = render(routes[2]!, "forest-green");
    const facts = ["안내 글 설명", "이 글의 정보", "대표 이미지", "목차", "본문", "공개 출처", "다시 확인하는 기준", "자주 묻는 질문", "관련 글"];
    expect(facts.every((fact) => html.includes(fact))).toBe(true);
    expect(html).toContain('<a href="#steps">신청 단계</a>');
    expect(html).toContain("운영 방식");
    expect(html).toContain('<section aria-labelledby="personal-reader-actions-title"');
    expect(html.match(/현재 글 저장/g)).toHaveLength(1);
    expect(html.indexOf("자주 묻는 질문")).toBeLessThan(html.indexOf("글 읽기 도구"));
    expect(html.indexOf("글 읽기 도구")).toBeLessThan(html.indexOf("관련 글"));
    expect(html).not.toMatch(/data-ad|ad-slot|광고 영역/);
  });

  it.each([null, undefined])("omits reader actions for %s", (readerActions) => {
    const article = routes[2]!;
    if (article.kind !== "article") throw new Error("article fixture is missing");
    const html = render({ ...article, readerActions }, "warm-neutral");

    expect(html).not.toContain("personal-reader-actions-title");
    expect(html).not.toContain("현재 글 저장");
  });
});
