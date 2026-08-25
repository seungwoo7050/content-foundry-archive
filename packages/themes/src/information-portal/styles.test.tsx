import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SKIN_TOKENS } from "../skin.js";
import {
  createPortalColorStyle,
  INFORMATION_PORTAL_STYLES,
} from "./styles.js";

describe("Information Portal styles", () => {
  it("binds skin values only through semantic custom properties", () => {
    const html = renderToStaticMarkup(
      <div style={createPortalColorStyle(SKIN_TOKENS["warm-neutral"])} />,
    );

    expect(html).toContain("--color-canvas:#FAF7F2");
    expect(html).toContain("--color-primary:#81501D");
    expect(html).toContain("--color-warning:#875A08");
    expect(html).toContain("--focus-ring:#6B3E12");
  });

  it("defines dense responsive grids without data claims", () => {
    expect(INFORMATION_PORTAL_STYLES).toContain("repeat(3,minmax(0,1fr))");
    expect(INFORMATION_PORTAL_STYLES).toContain("min-height:44px");
    expect(INFORMATION_PORTAL_STYLES).toContain(
      ".ip-nav-row .ip-masthead-search{border-color:var(--color-primary);",
    );
    expect(INFORMATION_PORTAL_STYLES).toContain(
      ".ip-article-reading-time{justify-self:start;",
    );
    expect(INFORMATION_PORTAL_STYLES).not.toMatch(/ranking|trending|popular/i);
  });

  it("presents search as a dense responsive portal utility", () => {
    for (const rule of [
      ".ip .search-controller form{display:grid;grid-template-columns:minmax(0,1fr) auto;",
      ".ip .search-controller input{min-width:0;min-height:48px;",
      ".ip .search-controller button{min-height:48px;",
      ".ip .search-controller button:disabled{cursor:wait;opacity:.58}",
      ".ip .search-controller .search-results article{min-width:0;padding:.75rem;overflow-wrap:anywhere;",
      ".ip .search-controller .search-results p:last-child{color:var(--color-text-muted);font-size:.78rem}",
      ".ip .search-controller .search-fallback a{display:inline-flex;min-height:44px;",
      ".ip .search-controller form{grid-template-columns:minmax(0,1fr)}",
      ".ip .search-controller form,.ip aside",
      ".ip .search-controller .search-fallback li{display:inline}",
    ]) {
      expect(INFORMATION_PORTAL_STYLES).toContain(rule);
    }
  });

  it("pins both article tracks to the first desktop grid row", () => {
    const desktopArticleStyles = INFORMATION_PORTAL_STYLES.slice(
      INFORMATION_PORTAL_STYLES.indexOf("@media (min-width:64rem){"),
      INFORMATION_PORTAL_STYLES.indexOf("@media (max-width:30rem)"),
    );

    expect(desktopArticleStyles).toContain(
      ".ip-article-main{grid-column:1;grid-row:1}",
    );
    expect(desktopArticleStyles).toContain(
      ".ip-article-rail{grid-column:2;grid-row:1}",
    );
  });

  it("preserves provenance while suppressing ads in print", () => {
    const printStyles = INFORMATION_PORTAL_STYLES.slice(
      INFORMATION_PORTAL_STYLES.indexOf("@media print"),
    );
    const hiddenSelectors = printStyles.match(
      /([^{}]+)\{display:none!important\}/,
    )?.[1] ?? "";

    expect(INFORMATION_PORTAL_STYLES).toContain("prefers-reduced-motion:reduce");
    expect(INFORMATION_PORTAL_STYLES).toContain("@media print");
    expect(hiddenSelectors).not.toContain(".ip-article-rail");
    expect(hiddenSelectors).toContain('.ip aside[aria-label="광고"]');
    expect(printStyles).toContain(
      ".ip-article-rail{display:block;margin-block:1rem;padding:.8rem;break-inside:avoid;border:1px solid #aaa;background:#fff}",
    );
    expect(printStyles).toContain(
      ".ip-article-rail>.ip-panel{margin:0;border:0;background:#fff}",
    );
    expect(INFORMATION_PORTAL_STYLES).toContain('.ip-body a[href^="http"]::after');
    expect(INFORMATION_PORTAL_STYLES).not.toMatch(/data-ad-|adsbygoogle/i);
  });

  it("gives home groups dense hierarchy without cropping artwork", () => {
    for (const className of [
      "ip-home-featured",
      "ip-home-current",
      "ip-home-reference",
      "ip-home-latest",
      "ip-home-category-highlight",
    ]) {
      expect(INFORMATION_PORTAL_STYLES).toContain(`.${className}`);
    }
    expect(INFORMATION_PORTAL_STYLES).toContain(
      ".content-image img{display:block;width:100%;max-width:100%;height:auto}",
    );
    expect(INFORMATION_PORTAL_STYLES).toContain(
      ".ip-home-featured>ul>li:first-child{grid-column:1/-1}",
    );
    expect(INFORMATION_PORTAL_STYLES).toContain(
      ".ip-home-reference>ul{grid-template-columns:repeat(4,minmax(0,1fr))}",
    );
    expect(INFORMATION_PORTAL_STYLES).toContain("@media (max-width:30rem)");
    expect(INFORMATION_PORTAL_STYLES).toContain("break-inside:avoid");
    expect(INFORMATION_PORTAL_STYLES).not.toMatch(/object-fit\s*:\s*cover/i);

    const groupStyles = INFORMATION_PORTAL_STYLES.slice(
      INFORMATION_PORTAL_STYLES.indexOf(":is(.ip-home-featured"),
      INFORMATION_PORTAL_STYLES.indexOf(".ip-article-reading-time"),
    );
    expect(groupStyles).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i);
  });
});
