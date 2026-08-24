import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type PublicRouteDispositions,
} from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { validateDispositionSourceClaims } from "./validate-disposition-source-claims";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

function withDisposition(
  item: PublicRouteDispositions["items"][number],
) {
  return {
    ...bundle,
    redirects: { items: [item] },
  };
}

describe("route disposition source claims", () => {
  it("returns a release whose disposition sources are unclaimed", () => {
    const release = withDisposition({
      type: "redirect",
      fromPath: "/old-about",
      toPath: "/about",
      status: 308,
    });

    expect(validateDispositionSourceClaims(release)).toBe(release);
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
  ])("rejects a redirect source claimed at %s", (path, kind, source) => {
    const release = withDisposition({
      type: "redirect",
      fromPath: path,
      toPath: "/destination",
      status: 301,
    });

    expect(() => validateDispositionSourceClaims(release)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          {
            path: "/redirects/items/0/fromPath",
            message: `route ${path} is already claimed by ${kind} at ${source}`,
          },
        ],
      }),
    );
  });

  it("rejects a gone source claimed by a generated page", () => {
    const release = withDisposition({
      type: "gone",
      path: "/about",
      status: 410,
      replacementPath: null,
    });

    expect(() => validateDispositionSourceClaims(release)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          {
            path: "/redirects/items/0/path",
            message: "route /about is already claimed by page at /pages/0/path",
          },
        ],
      }),
    );
  });
});
