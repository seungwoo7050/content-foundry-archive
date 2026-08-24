import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
  type NavigationItem,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  type NavigationRouteSource,
  validateNavigationDestinations,
} from "./validate-navigation-destinations";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

function withNavigation(items: NavigationItem[]) {
  return { ...bundle, navigation: { items } };
}

describe("navigation destinations", () => {
  it("accepts the v3 release navigation structure", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<NavigationRouteSource>();
  });

  it("accepts nested direct generated routes", () => {
    const release = withNavigation([
      {
        id: "content",
        label: "콘텐츠",
        path: "/about",
        children: [
          {
            id: "guide",
            label: "가이드",
            path: "/article/government24-resident-registration-guide",
            children: [],
          },
        ],
      },
    ]);

    expect(validateNavigationDestinations(release)).toBe(release);
  });

  it("reports invalid top-level and nested destinations in source order", () => {
    const release = withNavigation([
      {
        id: "old-about",
        label: "이전 소개",
        path: "/old-about",
        children: [
          {
            id: "expired",
            label: "만료",
            path: "/expired",
            children: [],
          },
          {
            id: "missing",
            label: "누락",
            path: "/missing",
            children: [],
          },
        ],
      },
    ]);

    expect(() => validateNavigationDestinations(release)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          {
            path: "/navigation/items/0/path",
            message: "not a direct generated route: /old-about",
          },
          {
            path: "/navigation/items/0/children/0/path",
            message: "not a direct generated route: /expired",
          },
          {
            path: "/navigation/items/0/children/1/path",
            message: "not a direct generated route: /missing",
          },
        ],
      }),
    );
  });
});
