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
});
