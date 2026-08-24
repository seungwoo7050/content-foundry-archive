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
});
