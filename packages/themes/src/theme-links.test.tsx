import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ThemeArticleList,
  ThemeBreadcrumbs,
  ThemeFooterNavigation,
  ThemeNavigation,
  ThemeRecoveryLinks,
} from "./theme-links.js";

describe("shared theme link primitives", () => {
  it("renders accessible footer navigation only when links exist", () => {
    expect(renderToStaticMarkup(<ThemeFooterNavigation items={[]} />)).toBe("");
    expect(renderToStaticMarkup(<ThemeFooterNavigation items={[
      { href: "/privacy", label: "개인정보 처리방침" },
      { href: "/contact", label: "문의" },
    ]} />)).toBe(
      '<nav aria-label="운영 및 정책"><ul>'
      + '<li><a href="/privacy">개인정보 처리방침</a></li>'
      + '<li><a href="/contact">문의</a></li>'
      + "</ul></nav>",
    );
  });

  it("renders recursive navigation with its caller-provided label", () => {
    const html = renderToStaticMarkup(<ThemeNavigation ariaLabel="주요 메뉴" items={[
      { link: { href: "/guide", label: "안내" }, children: [
        { link: { href: "/guide/start", label: "시작" }, children: [] },
      ] },
    ]} />);
    expect(html).toBe('<nav aria-label="주요 메뉴"><ul><li><a href="/guide">안내</a><ul><li><a href="/guide/start">시작</a></li></ul></li></ul></nav>');
  });

  it("renders recovery links in order without exposing kind as content", () => {
    expect(renderToStaticMarkup(<ThemeRecoveryLinks />)).toBe("");
    expect(renderToStaticMarkup(<ThemeRecoveryLinks items={undefined} />)).toBe("");
    expect(renderToStaticMarkup(<ThemeRecoveryLinks items={[]} />)).toBe("");
    expect(renderToStaticMarkup(<ThemeRecoveryLinks items={[
      { kind: "search", href: "/search", label: "검색" },
      { kind: "replacement", href: "/article/current", label: "최신 안내" },
    ]} />)).toBe(
      '<nav aria-label="페이지 복구 경로"><ul>'
      + '<li data-recovery-kind="search"><a href="/search">검색</a></li>'
      + '<li data-recovery-kind="replacement"><a href="/article/current">최신 안내</a></li>'
      + "</ul></nav>",
    );
  });

  it("links ancestors and marks the matching final breadcrumb as current", () => {
    const html = renderToStaticMarkup(<ThemeBreadcrumbs ariaLabel="현재 위치" currentPath="/article/start" items={[
      { href: "/", label: "홈" }, { href: "/article/start", label: "시작" },
    ]} />);
    expect(html).toBe('<nav aria-label="현재 위치"><ol><li><a href="/">홈</a></li><li><span aria-current="page">시작</span></li></ol></nav>');
    expect(() => renderToStaticMarkup(<ThemeBreadcrumbs ariaLabel="현재 위치" currentPath="/missing" items={[]} />)).toThrow("Breadcrumbs do not include current path");
  });

  it("renders only supplied article facts in a semantic ordered list", () => {
    const html = renderToStaticMarkup(<ThemeArticleList ordered headingLevel={3} articles={[{
      link: { href: "/article/start", label: "시작 안내" }, summary: "요약",
      date: { dateTime: "2026-08-24T00:00:00Z", label: "2026년 8월 24일" },
      category: { href: "/category/life", label: "생활" }, topics: ["신청"],
    }]} />);
    expect(html).toBe('<ol><li><article><p><a href="/category/life">생활</a> <time dateTime="2026-08-24T00:00:00Z">2026년 8월 24일</time></p><h3><a href="/article/start">시작 안내</a></h3><p>요약</p><ul><li>신청</li></ul></article></li></ol>');
    expect(html).not.toMatch(/badge|ranking|popular|trending/i);
  });
});
