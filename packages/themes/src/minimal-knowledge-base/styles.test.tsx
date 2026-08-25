import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SKIN_IDS, SKIN_TOKENS } from "../skin.js";
import { MinimalKnowledgeBaseShell } from "./shell.js";
import { MINIMAL_KNOWLEDGE_BASE_STYLES } from "./styles.js";

const shell = {
  locale: "ko-KR",
  skipLink: { href: "#main-content", label: "본문으로 바로가기" },
  brand: { href: "/", label: "생활메모" },
  description: "실생활 안내를 정리합니다.",
  primaryNavigation: [],
  footerText: "© 2026 생활메모",
} as const;

describe("Minimal Knowledge Base styles", () => {
  it.each(SKIN_IDS)("binds every %s semantic skin", (skinId) => {
    const html = renderToStaticMarkup(
      <MinimalKnowledgeBaseShell
        context={{ skinId, colors: SKIN_TOKENS[skinId] }}
        routePath="/"
        shell={shell}
      >
        <p>본문</p>
      </MinimalKnowledgeBaseShell>,
    );

    expect(html).toContain(`data-skin="${skinId}"`);
    for (const color of Object.values(SKIN_TOKENS[skinId])) {
      expect(html).toContain(color);
    }
    expect(html).toContain("grid-template-columns:16rem minmax(0,1fr)");
    expect(html).toContain("overflow-x:auto");
    expect(html).toContain("min-height:44px");
  });

  it("keeps knowledge-base CSS structural and claim free", () => {
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain("min-height:100vh");
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain("scroll-margin-top:1rem");
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      "line-height:1.55;word-break:keep-all",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      "line-height:1.65;word-break:keep-all",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-category-grid>ul>li:only-child",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-answer-first>p.kb-article-duration{",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-rail-search{display:flex;align-items:center;justify-content:center;min-height:44px;",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      "@media(prefers-reduced-motion:reduce)",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain("@media print");
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).not.toMatch(
      /ranking|popular|reading.?time|verified|newsletter|save/i,
    );
  });

  it("limits the home surface card to the final top-level about section", () => {
    const aboutSelector =
      '.kb-home-route>section[aria-labelledby="home-about-teaser-heading"]';

    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(`${aboutSelector}{`);
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(`${aboutSelector} h2{`);
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      `${aboutSelector} p:last-child{`,
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).not.toContain(
      ".kb-home-route>section[aria-labelledby]{",
    );
  });

  it("gives projected knowledge groups responsive hierarchy without cropping artwork", () => {
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-home-current{padding:",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-home-category-highlight{padding-top:",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-home-article-group article>figure img{display:block;width:100%;height:auto;",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-category-grid>ul,.kb-home-article-group>ul,.kb-latest-articles>ul",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-home-current>ul{grid-template-columns:minmax(0,1fr)}",
    );
    expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(
      ".kb-home-article-group>ul>li{margin-bottom:1rem;break-inside:avoid}",
    );
  });

  it("presents pagination as a responsive knowledge utility that does not print", () => {
    for (const rule of [
      '.theme-minimal-knowledge-base nav[aria-label="목록 페이지 이동"]{display:grid;min-width:0;grid-template-columns:minmax(0,1fr) auto;',
      'nav[aria-label="목록 페이지 이동"] p{min-width:0;margin:0;color:var(--color-text-muted);overflow-wrap:anywhere}',
      '[aria-current="page"]{display:inline-block;padding:.25rem .6rem;color:var(--color-primary);',
      'nav[aria-label="목록 페이지 이동"] ul{display:flex;min-width:0;flex-wrap:wrap;',
      'nav[aria-label="목록 페이지 이동"] a{display:inline-flex;min-height:44px;max-width:100%;',
      'padding:.5rem .8rem;overflow-wrap:anywhere;',
      'nav[aria-label="목록 페이지 이동"] a:focus-visible{outline:3px solid var(--focus-ring);',
      '@media(max-width:30rem){',
      'nav[aria-label="목록 페이지 이동"]{grid-template-columns:minmax(0,1fr);align-items:stretch}',
      'nav[aria-label="목록 페이지 이동"] ul{display:grid;grid-template-columns:minmax(0,1fr);width:100%}',
      'nav[aria-label="목록 페이지 이동"]{display:none!important}',
    ]) {
      expect(MINIMAL_KNOWLEDGE_BASE_STYLES).toContain(rule);
    }
  });
});
