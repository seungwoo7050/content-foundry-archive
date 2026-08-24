import { describe, expect, it } from "vitest";

import {
  getPaginationRouteFromArtifact,
  getPaginationRouteFromPathname,
} from "./static-pagination-artifacts.mjs";

describe("static pagination artifact paths", () => {
  it("maps archive and category artifacts to canonical routes", () => {
    expect(getPaginationRouteFromArtifact("archive/page/2.html"))
      .toBe("/archive/page/2");
    expect(getPaginationRouteFromArtifact("category/guides/page/12.html"))
      .toBe("/category/guides/page/12");
    expect(getPaginationRouteFromPathname("/category/guides/page/2"))
      .toBe("/category/guides/page/2");
    expect(getPaginationRouteFromArtifact("article/guide.html")).toBeNull();
  });

  it.each(["1", "01", "2.5", "9007199254740992"])(
    "rejects a non-canonical or unavailable page value %s",
    (page) => {
      expect(() => getPaginationRouteFromArtifact(`archive/page/${page}.html`))
        .toThrow(RangeError);
      expect(() => getPaginationRouteFromPathname(`/archive/page/${page}`))
        .toThrow(RangeError);
    },
  );
});
