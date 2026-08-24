import { describe, expect, expectTypeOf, it } from "vitest";

import { THEME_IDS, type ThemeId } from "./theme-id.js";

describe("theme identities", () => {
  it("keeps the five public theme identities frozen", () => {
    expect(THEME_IDS).toEqual([
      "minimal-knowledge-base",
      "friendly-mobile-utility",
      "editorial-utility",
      "clean-personal-blog",
      "information-portal",
    ]);
    expect(Object.isFrozen(THEME_IDS)).toBe(true);
  });

  it("derives the theme type from the runtime tuple", () => {
    expectTypeOf<ThemeId>().toEqualTypeOf<
      | "minimal-knowledge-base"
      | "friendly-mobile-utility"
      | "editorial-utility"
      | "clean-personal-blog"
      | "information-portal"
    >();
  });
});
