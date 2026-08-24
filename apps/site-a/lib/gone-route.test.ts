import type { LoadedReleaseBundleV3 } from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  findGoneRoute,
  getGoneArticleStaticParams,
  getGoneCategoryStaticParams,
  getGoneRootStaticParams,
  getGoneRouteOwner,
  getGoneRoutes,
  type GoneRouteSource,
} from "./gone-route";

const source = {
  redirects: {
    items: [
      { type: "redirect" as const },
      {
        type: "gone" as const,
        path: "/article/old-guide",
        status: 410 as const,
        replacementPath: "/archive",
      },
      {
        type: "gone" as const,
        path: "/category/old-topic",
        status: 410 as const,
        replacementPath: null,
      },
      {
        type: "gone" as const,
        path: "/guides/retired/deep",
        status: 410 as const,
        replacementPath: "/about",
      },
      {
        type: "gone" as const,
        path: "/article/deep/retired",
        status: 410 as const,
        replacementPath: null,
      },
    ],
  },
};

describe("gone route ownership", () => {
  it("accepts the v3 release disposition structure", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<GoneRouteSource>();
  });

  it("classifies only exact single-segment owner paths", () => {
    expect(getGoneRouteOwner("/article/old-guide")).toBe("article");
    expect(getGoneRouteOwner("/category/old-topic")).toBe("category");
    expect(getGoneRouteOwner("/article/deep/retired")).toBe("root");
    expect(getGoneRouteOwner("/article")).toBe("root");
  });

  it("projects owner-specific static parameters without redirects", () => {
    expect(getGoneArticleStaticParams(source)).toEqual([{ slug: "old-guide" }]);
    expect(getGoneCategoryStaticParams(source)).toEqual([
      { category: "old-topic" },
    ]);
    expect(getGoneRootStaticParams(source)).toEqual([
      { pagePath: ["guides", "retired", "deep"] },
      { pagePath: ["article", "deep", "retired"] },
    ]);
    expect(getGoneRoutes(source)).toHaveLength(4);
  });

  it("finds a gone replacement by exact path", () => {
    expect(findGoneRoute(source, "/article/old-guide")?.replacementPath).toBe(
      "/archive",
    );
    expect(findGoneRoute(source, "/missing")).toBeUndefined();
  });
});
