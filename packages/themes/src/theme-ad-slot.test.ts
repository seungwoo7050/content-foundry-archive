import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";

import type { ThemeRenderContext } from "./html-route-view-model.js";
import {
  getThemeAdSlot,
  type AdSlotId,
  type ThemeAdSlotContext,
  type ThemeAdSlots,
} from "./theme-ad-slot.js";

describe("theme ad slot injection", () => {
  it("returns an injected known slot without changing its node", () => {
    const injected = createElement("aside", { "data-slot": "article-end" }, "광고");
    const context: ThemeAdSlotContext = {
      adSlots: { "article-end": injected },
    };

    expect(getThemeAdSlot(context, "article-end")).toBe(injected);
    expect(renderToStaticMarkup(getThemeAdSlot(context, "article-end"))).toBe(
      '<aside data-slot="article-end">광고</aside>',
    );
  });

  it("returns null for absent slots and invents no fallback markup", () => {
    const context: ThemeAdSlotContext = { adSlots: {} };

    expect(getThemeAdSlot(context, "home-feed")).toBeNull();
    expect(getThemeAdSlot({}, "desktop-sidebar")).toBeNull();
    expect(renderToStaticMarkup(getThemeAdSlot(context, "home-feed"))).toBe("");
  });

  it("keeps the render context map optional, readonly, and slot-keyed", () => {
    expectTypeOf<ThemeAdSlots>().toEqualTypeOf<
      Readonly<Partial<Record<AdSlotId, ReactNode>>>
    >();
    expectTypeOf<ThemeRenderContext>().toMatchTypeOf<ThemeAdSlotContext>();
  });
});
