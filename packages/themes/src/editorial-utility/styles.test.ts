import { describe, expect, it } from "vitest";

import { EDITORIAL_UTILITY_STYLES } from "./styles.js";

describe("Editorial Utility output styles", () => {
  it("supports reduced motion and a content-first print layout", () => {
    expect(EDITORIAL_UTILITY_STYLES).toContain("prefers-reduced-motion: reduce");
    expect(EDITORIAL_UTILITY_STYLES).toContain("@media print");
    expect(EDITORIAL_UTILITY_STYLES).toContain(".editorial-reader-actions");
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-category-strip .editorial-masthead-search { display: inline-flex; min-height: 44px;",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain('.editorial-body a[href^="http"]::after');
    expect(EDITORIAL_UTILITY_STYLES).not.toMatch(/data-ad-|adsbygoogle/i);
    expect(EDITORIAL_UTILITY_STYLES).not.toContain(
      ".editorial-evidence { order: 2; }",
    );
  });

  it("gives editorial home groups responsive hierarchy without cropping artwork", () => {
    for (const className of [
      "editorial-home-featured",
      "editorial-home-current",
      "editorial-home-reference",
      "editorial-home-latest",
      "editorial-home-category-highlight",
    ]) {
      expect(EDITORIAL_UTILITY_STYLES).toContain(`.${className}`);
    }
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".content-image img { display: block; width: 100%; max-width: 100%; height: auto; }",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-home-featured article:has(> .content-image) { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(16rem, .75fr);",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-home-current > ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-home-reference > ul { grid-template-columns: repeat(4, minmax(0, 1fr)); }",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain("@media (max-width: 30rem)");
    expect(EDITORIAL_UTILITY_STYLES).toContain("break-inside: avoid");
    expect(EDITORIAL_UTILITY_STYLES).not.toMatch(/object-fit\s*:\s*cover/i);

    const groupStyles = EDITORIAL_UTILITY_STYLES.slice(
      EDITORIAL_UTILITY_STYLES.indexOf(":is(.editorial-home-featured"),
      EDITORIAL_UTILITY_STYLES.indexOf(".editorial-section {"),
    );
    expect(groupStyles).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i);
  });

  it("presents search as a responsive editorial utility", () => {
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-search-client .search-controller form { display: grid; grid-template-columns: minmax(0, 1fr) auto;",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain("min-height: 48px");
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-search-client .search-results article { min-width: 0;",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain("overflow-wrap: anywhere");
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-search-client .search-fallback a { display: inline-flex; min-height: 44px;",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-search-client .search-controller form { grid-template-columns: minmax(0, 1fr); }",
    );
    expect(EDITORIAL_UTILITY_STYLES).toContain(
      ".editorial-search-client form, .editorial-utility aside",
    );
  });

  it("presents pagination as responsive editorial navigation", () => {
    for (const rule of [
      '.editorial-utility nav[aria-label="목록 페이지 이동"] { display: grid; grid-template-columns: auto minmax(0, 1fr);',
      '.editorial-utility nav[aria-label="목록 페이지 이동"] span[aria-current="page"] { display: inline-flex;',
      '.editorial-utility nav[aria-label="목록 페이지 이동"] a { display: inline-flex; min-height: 44px;',
      'overflow-wrap: anywhere; color: var(--editorial-text);',
      '.editorial-utility nav[aria-label="목록 페이지 이동"] a:focus-visible { outline: 3px solid var(--editorial-focus-ring);',
      '.editorial-utility nav[aria-label="목록 페이지 이동"] { grid-template-columns: minmax(0, 1fr); gap: .6rem; }',
      '.editorial-utility nav[aria-label="목록 페이지 이동"] ul { display: grid; grid-template-columns: minmax(0, 1fr); }',
      '.editorial-utility nav[aria-label="목록 페이지 이동"] { display: none !important; }',
    ]) {
      expect(EDITORIAL_UTILITY_STYLES).toContain(rule);
    }
  });
});
