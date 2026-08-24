import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { getRouteClaims } from "./route-claims";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("generated route claims", () => {
  it("preserves fixed and release-record provenance", () => {
    expect(Object.fromEntries(getRouteClaims(bundle))).toEqual({
      "/": { kind: "fixed-home", source: "fixed home route" },
      "/404": { kind: "fixed-not-found", source: "fixed not-found route" },
      "/_release.json": {
        kind: "fixed-release-identity",
        source: "fixed release-identity route",
      },
      "/article/government24-resident-registration-guide": {
        kind: "article",
        source: "/articles/0/seo/canonicalPath",
      },
      "/category/daily-admin": {
        kind: "category",
        source: "/taxonomy/categories/0/slug",
      },
      "/about": { kind: "page", source: "/pages/0/path" },
    });
  });

  it.each([
    ["/404", "fixed-not-found", "fixed not-found route"],
    [
      "/article/government24-resident-registration-guide",
      "article",
      "/articles/0/seo/canonicalPath",
    ],
    ["/category/daily-admin", "category", "/taxonomy/categories/0/slug"],
    ["/about", "page", "/pages/0/path"],
  ])("rejects a page collision at %s", (path, kind, source) => {
    const conflictingBundle = structuredClone(bundle);
    const page = structuredClone(conflictingBundle.pages[0]!);
    const collision = {
      ...page,
      id: `collision-${kind}`,
      path,
      seo: { ...page.seo, canonicalPath: path },
    };

    expect(() =>
      getRouteClaims({
        ...conflictingBundle,
        pages: [...conflictingBundle.pages, collision],
      }),
    ).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          {
            path: "/pages/1/path",
            message: `route ${path} is already claimed by ${kind} at ${source}`,
          },
        ],
      }),
    );
  });
});
