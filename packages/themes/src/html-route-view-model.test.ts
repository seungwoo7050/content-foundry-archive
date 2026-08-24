import { describe, expect, expectTypeOf, it } from "vitest";

import {
  HTML_ROUTE_KINDS,
  type HtmlRouteKind,
  type HtmlRouteViewModel,
} from "./html-route-view-model.js";

type DistributedKeys<T> = T extends unknown ? keyof T : never;
type ForbiddenBoundaryKey = Extract<
  DistributedKeys<HtmlRouteViewModel>,
  | "bundle"
  | "contractVersion"
  | "release"
  | "taxonomyId"
  | "categoryId"
  | "media"
  | "mediaId"
  | "articleId"
>;

describe("HTML route boundary", () => {
  it("enumerates every rendered route kind exactly once", () => {
    expect(HTML_ROUTE_KINDS).toEqual([
      "home",
      "category",
      "article",
      "static-page",
      "archive",
      "search",
      "not-found",
      "retired",
    ]);
    expect(new Set(HTML_ROUTE_KINDS).size).toBe(HTML_ROUTE_KINDS.length);
    expect(Object.isFrozen(HTML_ROUTE_KINDS)).toBe(true);
  });

  it("derives the route discriminator from the public union", () => {
    expectTypeOf<(typeof HTML_ROUTE_KINDS)[number]>().toEqualTypeOf<HtmlRouteKind>();
    expectTypeOf<ForbiddenBoundaryKey>().toEqualTypeOf<never>();
  });
});
