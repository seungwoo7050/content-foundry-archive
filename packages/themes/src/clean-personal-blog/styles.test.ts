import { describe, expect, it } from "vitest";

import { CLEAN_PERSONAL_BLOG_STYLES } from "./styles.js";

describe("Clean Personal Blog output styles", () => {
  it("supports reduced motion and a provenance-preserving print view", () => {
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain("prefers-reduced-motion: reduce");
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain("@media print");
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(".personal-article-meta");
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(
      ".personal-article-reading-time { display: inline-block;",
    );
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(
      ".personal-nav .personal-masthead-search { display: inline-flex; min-height: 44px;",
    );
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain('.personal-body a[href^="http"]::after');
    expect(CLEAN_PERSONAL_BLOG_STYLES).not.toMatch(/data-ad-|adsbygoogle/i);
  });

  it("keeps home group hierarchy spacious, responsive, and crop free", () => {
    for (const className of [
      "personal-home-featured",
      "personal-home-current",
      "personal-home-reference",
      "personal-home-latest",
      "personal-home-category-highlight",
    ]) {
      expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(`.${className}`);
    }
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(
      ".content-image img { display: block; width: 100%; max-width: 100%; height: auto; }",
    );
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(
      ".personal-home-featured { margin-block: clamp(3.5rem, 9vw, 5.5rem); }",
    );
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(
      ".personal-home-current article { padding: 1.25rem;",
    );
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(
      ".personal-categories, .personal-home-reference > ul { grid-template-columns: repeat(2, minmax(0, 1fr)); }",
    );
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain("@media (max-width: 30rem)");
    expect(CLEAN_PERSONAL_BLOG_STYLES).toContain("break-inside: avoid");
    expect(CLEAN_PERSONAL_BLOG_STYLES).not.toMatch(/object-fit\s*:\s*cover/i);

    const groupStyles = CLEAN_PERSONAL_BLOG_STYLES.slice(
      CLEAN_PERSONAL_BLOG_STYLES.indexOf(":is(.personal-home-featured"),
      CLEAN_PERSONAL_BLOG_STYLES.indexOf(".personal-topics {"),
    );
    expect(groupStyles).not.toMatch(/#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i);
  });

  it("presents search as a warm responsive reading utility", () => {
    for (const rule of [
      ".personal-search-client .search-controller form { display: grid; grid-template-columns: minmax(0, 1fr) auto;",
      ".personal-search-client .search-controller input { min-width: 0; min-height: 48px;",
      ".personal-search-client .search-controller button { min-height: 48px;",
      ".personal-search-client .search-controller button:disabled { cursor: wait; opacity: .58; }",
      ".personal-search-client .search-results article { min-width: 0; padding: 1rem; overflow-wrap: anywhere;",
      ".personal-search-client .search-fallback a { display: inline-flex; min-height: 44px;",
      ".personal-search-client .search-controller form { grid-template-columns: minmax(0, 1fr); }",
      ".personal-search-client .search-controller form, .personal-search-client .search-fallback { display: none !important; }",
      ".personal-search-client .search-results article { break-inside: avoid; border-radius: 0; background: #fff; }",
    ]) {
      expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(rule);
    }
  });

  it("presents pagination as warm navigation that reflows and does not print", () => {
    for (const rule of [
      '.personal-blog nav[aria-label="목록 페이지 이동"] { display: flex; min-width: 0; flex-wrap: wrap;',
      'nav[aria-label="목록 페이지 이동"] p { min-width: 0; flex: 1 1 12rem;',
      '[aria-current="page"] { display: inline-block; padding: .25rem .6rem;',
      'nav[aria-label="목록 페이지 이동"] ul { display: flex; flex: 1 1 auto; flex-wrap: wrap;',
      'nav[aria-label="목록 페이지 이동"] a { display: inline-flex; min-height: 44px; max-width: 100%;',
      'padding: .5rem .8rem; overflow-wrap: anywhere;',
      'nav[aria-label="목록 페이지 이동"] a:focus-visible { outline: 3px solid var(--personal-focus-ring);',
      'nav[aria-label="목록 페이지 이동"] { display: grid; align-items: stretch; }',
      'nav[aria-label="목록 페이지 이동"] ul { display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; }',
      'nav[aria-label="목록 페이지 이동"] { display: none !important; }',
    ]) {
      expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(rule);
    }
  });

  it("presents reader actions as warm stateful controls that do not print", () => {
    for (const rule of [
      'section[aria-labelledby="personal-reader-actions-title"] { margin-block: 3.5rem;',
      ":is(.article-bookmark, .article-share-action, .article-feedback) { min-width: 0; margin: 0; padding: 1rem 1.1rem;",
      ":is(.article-bookmark, .article-share-action, .article-feedback) button { display: inline-flex; min-height: 44px;",
      "button:focus-visible { outline: 3px solid var(--personal-focus-ring);",
      "button:disabled { cursor: not-allowed; opacity: .55; }",
      'button[aria-pressed="true"] { color: var(--personal-primary); background: var(--personal-surface-muted);',
      ':is([role="status"], [aria-live="polite"]) { min-width: 0; min-height: 1.5em;',
      ":is(.article-bookmark, .article-share-action) { grid-template-columns: minmax(0, 1fr); }",
      '.article-feedback [role="group"] { display: grid; grid-template-columns: minmax(0, 1fr); }',
      'section[aria-labelledby="personal-reader-actions-title"] { display: none !important; }',
    ]) {
      expect(CLEAN_PERSONAL_BLOG_STYLES).toContain(rule);
    }
  });
});
