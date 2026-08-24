import { describe, expect, expectTypeOf, it } from "vitest";

import type { ThemeModule } from "../theme-module.js";
import { informationPortalTheme } from "./module.js";

describe("Information Portal module", () => {
  it("declares exact portal identity, slots, density, and route capability", () => {
    expectTypeOf(informationPortalTheme).toMatchTypeOf<ThemeModule>();
    expect(informationPortalTheme.id).toBe("information-portal");
    expect(informationPortalTheme.supportedSlots).toEqual([
      "home-feed",
      "article-after-summary",
      "article-end",
      "desktop-sidebar",
    ]);
    expect(informationPortalTheme.qualityExpectations).toEqual({
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
      density: "dense",
      articleMeasure: "standard",
    });
  });
});
