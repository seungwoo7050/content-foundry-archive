import { describe, expect, expectTypeOf, it } from "vitest";

import type { ThemeModule } from "../theme-module.js";
import { friendlyMobileUtilityTheme } from "./module.js";

describe("Friendly Mobile Utility module", () => {
  it("declares exact identity, conservative slots, and full route capability", () => {
    expectTypeOf(friendlyMobileUtilityTheme).toMatchTypeOf<ThemeModule>();
    expect(friendlyMobileUtilityTheme.id).toBe("friendly-mobile-utility");
    expect(friendlyMobileUtilityTheme.supportedSlots).toEqual([
      "home-feed",
      "article-after-summary",
      "article-end",
    ]);
    expect(friendlyMobileUtilityTheme.qualityExpectations).toEqual({
      routeKinds: [
        "home",
        "category",
        "article",
        "static-page",
        "archive",
        "search",
        "not-found",
        "retired",
      ],
      density: "spacious",
      articleMeasure: "narrow",
    });
  });
});
