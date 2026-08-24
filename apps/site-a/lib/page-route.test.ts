import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { findPageByPathSegments, getPageStaticParams } from "./page-route";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("static page route selection", () => {
  it("enumerates canonical paths as catch-all segment arrays", () => {
    const nestedBundle = structuredClone(bundle);
    nestedBundle.pages[0]!.path = "/legal/privacy-policy";
    nestedBundle.pages[0]!.seo.canonicalPath = "/legal/privacy-policy";

    expect(getPageStaticParams(nestedBundle)).toEqual([
      { pagePath: ["legal", "privacy-policy"] },
    ]);
  });

  it("selects only an exact validated page path", () => {
    expect(findPageByPathSegments(bundle, ["about"])?.id).toBe("about");
    expect(findPageByPathSegments(bundle, ["about", "extra"])).toBeUndefined();
    expect(findPageByPathSegments(bundle, [])).toBeUndefined();
  });

  it.each([
    ["/404", "fixed not-found route"],
    ["/article", "article route namespace"],
    ["/article/legal/terms", "article route namespace"],
    ["/category", "category route namespace"],
    ["/category/daily-admin", "category route namespace"],
  ])("rejects a page path owned by %s", (path, owner) => {
    const conflictingBundle = structuredClone(bundle);
    conflictingBundle.pages[0]!.path = path;
    conflictingBundle.pages[0]!.seo.canonicalPath = path;

    expect(() => getPageStaticParams(conflictingBundle)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          {
            path: "/pages/0/path",
            message: `route ${path} conflicts with ${owner}`,
          },
        ],
      }),
    );
  });

  it("uses segment boundaries when reserving namespaces", () => {
    const allowedBundle = structuredClone(bundle);
    const pages = [
      ...allowedBundle.pages,
      {
        ...structuredClone(allowedBundle.pages[0]!),
        id: "articles",
        path: "/articles",
      },
      {
        ...structuredClone(allowedBundle.pages[0]!),
        id: "category-guide",
        path: "/category-guide",
      },
    ];

    expect(getPageStaticParams({ ...allowedBundle, pages })).toEqual([
      { pagePath: ["about"] },
      { pagePath: ["articles"] },
      { pagePath: ["category-guide"] },
    ]);
  });
});
