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
  it("contains exactly the navigable HTML routes in release order", () => {
    const routes = getGeneratedRoutes(bundle);

    expect([...routes]).toEqual([
      "/",
      "/article/government24-resident-registration-guide",
      "/about",
      "/category/daily-admin",
    ]);
    expect(routes.has("/404")).toBe(false);
    expect(routes.has("/_release.json")).toBe(false);
  });
});
