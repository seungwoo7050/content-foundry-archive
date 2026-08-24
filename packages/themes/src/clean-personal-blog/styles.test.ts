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
});
