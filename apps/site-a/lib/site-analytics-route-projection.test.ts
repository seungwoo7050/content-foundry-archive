import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createSiteAnalyticsRouteProjection,
  resolveAnalyticsRouteType,
  type AnalyticsRouteProjectionSource,
} from "./site-analytics-route-projection";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const withDispositions = {
  ...bundle,
  redirects: {
    items: [
      { type: "redirect", fromPath: "/legacy", toPath: "/about", status: 301 },
      { type: "gone", path: "/retired-help", status: 410, replacementPath: "/about" },
    ] as const,
  },
};

describe("Site A analytics route projection", () => {
  it("accepts the v3 release bundle shape", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<AnalyticsRouteProjectionSource>();
  });

  it("projects stable identity and only rendered route paths", () => {
    const projection = createSiteAnalyticsRouteProjection(withDispositions);

    expect(projection.baseContext).toEqual({
      eventContractVersion: "1.0.0",
      siteId: "site-a",
      releaseId: "REL-2026-000042",
      themeId: "minimal-knowledge-base",
      skinId: "calm-blue",
    });
    expect(projection.routeTypesByPath).toEqual({
      "/": "home",
      "/archive": "archive",
      "/search": "search",
      "/404": "not-found",
      "/article/government24-resident-registration-guide": "article",
      "/category/daily-admin": "category",
      "/about": "static-page",
      "/retired-help": "retired",
    });
    expect(projection.routeDestinationsByPath).toEqual({
      "/article/government24-resident-registration-guide": {
        destinationType: "article",
        destinationId: "ART-000123",
      },
      "/category/daily-admin": {
        destinationType: "category",
        destinationId: "daily-admin",
      },
    });
    expect(resolveAnalyticsRouteType(projection, "/legacy")).toBe("not-found");
    expect(resolveAnalyticsRouteType(projection, "/ads.txt")).toBe("not-found");
  });

  it("rejects a gone path that collides with generated HTML", () => {
    expect(() => createSiteAnalyticsRouteProjection({
      ...bundle,
      redirects: {
        items: [{ type: "gone", path: "/about", status: 410, replacementPath: null }],
      },
    })).toThrow("Analytics route path is claimed more than once: /about");
  });
});
