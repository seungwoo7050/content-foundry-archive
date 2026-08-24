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
    expect(FRIENDLY_MOBILE_STYLES).not.toMatch(/saved|bookmark|popular|ranking/i);
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
