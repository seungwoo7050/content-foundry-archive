import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { getGeneratedRoutes } from "./generated-routes";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("generated route inventory", () => {
  it("contains exactly the navigable HTML routes", () => {
    const routes = getGeneratedRoutes(bundle);

    expect(routes).toEqual(new Set([
      "/",
      "/archive",
      "/search",
      "/article/government24-resident-registration-guide",
      "/about",
      "/category/daily-admin",
    ]));
    expect(routes.has("/404")).toBe(false);
    expect(routes.has("/_release.json")).toBe(false);
  });

  it("rejects duplicate claims before collapsing them into a set", () => {
    const duplicate = structuredClone(bundle.pages[0]!);

    expect(() =>
      getGeneratedRoutes({
        ...bundle,
        pages: [...bundle.pages, { ...duplicate, id: "about-copy" }],
      }),
    ).toThrowError(expect.objectContaining({ code: "REFERENCE_INVALID" }));
  });
});
