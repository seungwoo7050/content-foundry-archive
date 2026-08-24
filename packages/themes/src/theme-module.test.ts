import { describe, expect, expectTypeOf, it } from "vitest";

import {
  AD_SLOT_IDS,
  type AdSlotId,
  type ThemeModule,
} from "./theme-module.js";

describe("theme module contract", () => {
  it("freezes the provider-neutral manual ad slot vocabulary", () => {
    expect(AD_SLOT_IDS).toEqual([
      "home-feed",
      "article-after-summary",
      "article-mid-1",
      "article-mid-2",
      "article-end",
      "desktop-sidebar",
    ]);
    expect(Object.isFrozen(AD_SLOT_IDS)).toBe(true);
    expectTypeOf<AdSlotId>().toEqualTypeOf<
      | "home-feed"
      | "article-after-summary"
      | "article-mid-1"
      | "article-mid-2"
      | "article-end"
      | "desktop-sidebar"
    >();
  });

  it("requires every renderer to declare identity, slots, quality, and route output", () => {
    expectTypeOf<ThemeModule>().toHaveProperty("id");
    expectTypeOf<ThemeModule>().toHaveProperty("supportedSlots");
    expectTypeOf<ThemeModule>().toHaveProperty("qualityExpectations");
    expectTypeOf<ThemeModule>().toHaveProperty("renderRoute");
  });
});
