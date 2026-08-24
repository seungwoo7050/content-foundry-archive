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
      ".fmu-article-reading-time{width:max-content;max-width:100%",
    );
    expect(FRIENDLY_MOBILE_STYLES).not.toMatch(/saved|bookmark|popular|ranking/i);
  });

  it("preserves readable content for print and reduced-motion readers", () => {
    expect(FRIENDLY_MOBILE_STYLES).toContain("prefers-reduced-motion:reduce");
    expect(FRIENDLY_MOBILE_STYLES).toContain("@media print");
    expect(FRIENDLY_MOBILE_STYLES).toContain('.fmu-body a[href^="http"]::after');
    expect(FRIENDLY_MOBILE_STYLES).toContain('.fmu aside[aria-label="광고"]');
  });
});
