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
    expect(INFORMATION_PORTAL_STYLES).not.toMatch(/ranking|trending|popular/i);
  });

  it("supports reduced motion and a main-first print layout", () => {
    expect(INFORMATION_PORTAL_STYLES).toContain("prefers-reduced-motion:reduce");
    expect(INFORMATION_PORTAL_STYLES).toContain("@media print");
    expect(INFORMATION_PORTAL_STYLES).toContain(".ip-article-rail");
    expect(INFORMATION_PORTAL_STYLES).toContain('.ip-body a[href^="http"]::after');
    expect(INFORMATION_PORTAL_STYLES).not.toMatch(/data-ad-|adsbygoogle/i);
  });
});
