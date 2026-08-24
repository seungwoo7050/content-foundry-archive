import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type PublicRouteDispositions,
} from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { validateSiteRouteGraph } from "./validate-site-route-graph";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

function withDisposition(
  item: PublicRouteDispositions["items"][number],
) {
  return { ...bundle, redirects: { items: [item] } };
}

describe("Site A route graph", () => {
  it("returns the valid release unchanged", () => {
    expect(validateSiteRouteGraph(bundle)).toBe(bundle);
  });

  it("reports source ownership before destination resolution", () => {
    const release = withDisposition({
      type: "redirect",
      fromPath: "/about",
      toPath: "/missing",
      status: 308,
    });

    expect(() => validateSiteRouteGraph(release)).toThrowError(
      expect.objectContaining({
        message: "Route dispositions overlap generated outputs",
      }),
    );
  });

  it("reports destination resolution after sources are unclaimed", () => {
    const release = withDisposition({
      type: "redirect",
      fromPath: "/old-about",
      toPath: "/missing",
      status: 308,
    });

    expect(() => validateSiteRouteGraph(release)).toThrowError(
      expect.objectContaining({
        message: "Route disposition targets do not resolve directly",
      }),
    );
  });
});
