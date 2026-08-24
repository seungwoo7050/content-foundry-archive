import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type PublicRouteDispositions,
} from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { validateDispositionTargets } from "./validate-disposition-targets";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

function withDispositions(items: PublicRouteDispositions["items"]) {
  return { ...bundle, redirects: { items } };
}

describe("route disposition targets", () => {
  it("accepts direct generated targets and a null gone replacement", () => {
    const release = withDispositions([
      {
        type: "redirect",
        fromPath: "/old-about",
        toPath: "/about",
        status: 308,
      },
      {
        type: "gone",
        path: "/retired-without-replacement",
        status: 410,
        replacementPath: null,
      },
      {
        type: "gone",
        path: "/retired-guide",
        status: 410,
        replacementPath: "/article/government24-resident-registration-guide",
      },
    ]);

    expect(validateDispositionTargets(release)).toBe(release);
  });

  it("aggregates missing, chained, gone, and artifact targets", () => {
    const release = withDispositions([
      { type: "redirect", fromPath: "/one", toPath: "/missing", status: 301 },
      { type: "redirect", fromPath: "/two", toPath: "/three", status: 308 },
      { type: "redirect", fromPath: "/three", toPath: "/about", status: 308 },
      { type: "gone", path: "/retired", status: 410, replacementPath: "/two" },
      { type: "gone", path: "/older", status: 410, replacementPath: "/retired" },
      { type: "redirect", fromPath: "/legacy", toPath: "/retired", status: 301 },
      { type: "redirect", fromPath: "/not-found", toPath: "/404", status: 301 },
      {
        type: "redirect",
        fromPath: "/machine",
        toPath: "/_release.json",
        status: 301,
      },
    ]);

    expect(() => validateDispositionTargets(release)).toThrowError(
      expect.objectContaining({
        code: "REFERENCE_INVALID",
        issues: [
          { path: "/redirects/items/0/toPath", message: "not a direct generated route: /missing" },
          { path: "/redirects/items/1/toPath", message: "not a direct generated route: /three" },
          { path: "/redirects/items/3/replacementPath", message: "not a direct generated route: /two" },
          { path: "/redirects/items/4/replacementPath", message: "not a direct generated route: /retired" },
          { path: "/redirects/items/5/toPath", message: "not a direct generated route: /retired" },
          { path: "/redirects/items/6/toPath", message: "not a direct generated route: /404" },
          { path: "/redirects/items/7/toPath", message: "not a direct generated route: /_release.json" },
        ],
      }),
    );
  });
});
