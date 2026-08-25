import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SKIN_TOKENS } from "../skin.js";
import {
  createFriendlyColorStyle,
  FRIENDLY_MOBILE_STYLES,
} from "./styles.js";

describe("Friendly Mobile Utility styles", () => {
  it("binds every semantic skin value through CSS custom properties", () => {
    const html = renderToStaticMarkup(
      <div style={createFriendlyColorStyle(SKIN_TOKENS["forest-green"])} />,
    );

    expect(html).toContain("--color-canvas:#F4F8F4");
    expect(html).toContain("--color-primary:#236B3B");
    expect(html).toContain("--color-danger:#A62A23");
    expect(html).toContain("--focus-ring:#17522C");
  });

  it("keeps primary navigation and actions touch-oriented", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain("min-height:48px");
    expect(FRIENDLY_MOBILE_STYLES).toContain("var(--color-surface-muted)");
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu-header-search{display:inline-flex;min-height:48px;",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu-article-reading-time{width:max-content;max-width:100%",
    );
    expect(FRIENDLY_MOBILE_STYLES).not.toMatch(/saved|popular|ranking/i);
  });

  it("gives every factual home group a distinct hierarchy", () => {
    for (const id of [
      "fmu-home-featured",
      "fmu-home-current",
      "fmu-home-evergreen",
      "fmu-home-latest",
    ]) {
      expect(FRIENDLY_MOBILE_STYLES).toContain(id);
    }
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '.fmu-list:has(>h2>a[href^="/category/"])',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain("border-top:.3rem solid var(--color-primary)");
    expect(FRIENDLY_MOBILE_STYLES).toContain("border-left:.3rem solid var(--color-primary)");
    expect(FRIENDLY_MOBILE_STYLES).not.toMatch(/popular|trending|ranking|인기|순위/i);
  });

  it("preserves intrinsic artwork and a narrow-screen single column", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu-list .content-image img{display:block;width:100%;max-width:100%;height:auto}",
    );
    expect(FRIENDLY_MOBILE_STYLES).not.toMatch(/object-fit:cover|aspect-ratio/);
    expect(FRIENDLY_MOBILE_STYLES).toContain("@media (max-width:30rem)");
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      "grid-template-columns:repeat(2,minmax(0,1fr))",
    );
  });

  it("contains long unbroken text in every article list card", () => {
    const cardRule = FRIENDLY_MOBILE_STYLES.match(
      /\.fmu-list article\{([^}]*)\}/,
    )?.[1];

    expect(cardRule).toContain("min-width:0");
    expect(cardRule).toContain("overflow-wrap:anywhere");
  });

  it("presents search controls, results, and fallback links as a responsive utility", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu .search-controller form{display:grid;grid-template-columns:minmax(0,1fr) auto",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu .search-controller input{width:100%;min-width:0;min-height:48px",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu .search-controller button{min-height:48px",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu .search-controller button:disabled{cursor:wait;opacity:.58}",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu .search-results,.fmu .search-fallback ul{display:grid",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu .search-results article{min-width:0;padding:1rem;overflow-wrap:anywhere",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      "@media (max-width:30rem){.fmu .search-controller form{grid-template-columns:1fr}",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu .search-controller form,.fmu .search-fallback{display:none!important}",
    );
  });

  it("presents pagination as touch-friendly navigation that reflows and does not print", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '.fmu nav[aria-label="목록 페이지 이동"]{display:flex;min-width:0;flex-wrap:wrap',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '[aria-current="page"]{display:inline-block;padding:.25rem .55rem;',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      'nav[aria-label="목록 페이지 이동"] ul{display:flex;flex:1 1 auto;flex-wrap:wrap;',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      'nav[aria-label="목록 페이지 이동"] a{display:inline-flex;min-height:44px;max-width:100%;',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      "padding:.55rem .85rem;overflow-wrap:anywhere;",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      'nav[aria-label="목록 페이지 이동"] a:focus-visible{outline:3px solid var(--focus-ring)',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '@media (max-width:30rem){.fmu nav[aria-label="목록 페이지 이동"]{display:grid;',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '.fmu nav[aria-label="목록 페이지 이동"]{display:none!important}',
    );
  });

  it("presents reader actions as stateful touch controls that do not print", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ":is(.article-bookmark,.article-share-action,.article-feedback){min-width:0",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ":is(.article-bookmark,.article-share-action,.article-feedback) button{display:inline-flex;min-height:44px",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      "button:focus-visible{outline:3px solid var(--focus-ring)",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      "button:disabled{cursor:not-allowed;opacity:.58}",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      'button[aria-pressed="true"]{color:var(--color-primary);background:var(--color-surface)',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ':is([role="status"],[aria-live="polite"]){display:block;min-width:0;min-height:1.5em',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '@media (max-width:30rem){.fmu :is(.article-bookmark,.article-share-action){grid-template-columns:1fr}',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      'section[aria-labelledby="fmu-reader-actions"]{display:none!important}',
    );
  });

  it("uses a broad desktop shell while protecting the article reading measure", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu-header-inner,.fmu-main,.fmu-footer-inner{width:min(100%,48rem)",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      "@media screen and (min-width:64rem)",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      ".fmu-header-inner,.fmu-footer-inner{width:min(100%,72rem)}",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '.fmu-main:is([data-route-kind="home"],[data-route-kind="category"],[data-route-kind="archive"],[data-route-kind="search"],[data-route-kind="static-page"]){width:min(100%,72rem)}',
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      '.fmu-main[data-route-kind="article"]{width:min(100%,52rem)}',
    );
  });

  it("preserves readable content for print and reduced-motion readers", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain("prefers-reduced-motion:reduce");
    expect(FRIENDLY_MOBILE_STYLES).toContain(
      "animation:none!important;transition:none!important",
    );
    expect(FRIENDLY_MOBILE_STYLES).toContain("@media print");
    expect(FRIENDLY_MOBILE_STYLES).toContain('.fmu-body a[href^="http"]::after');
    expect(FRIENDLY_MOBILE_STYLES).toContain('.fmu aside[aria-label="광고"]');
    expect(FRIENDLY_MOBILE_STYLES).toContain("margin-bottom:.8rem;break-inside:avoid");
  });
});
