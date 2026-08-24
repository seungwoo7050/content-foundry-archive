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
  });
});
