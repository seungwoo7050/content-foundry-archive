import { resolve } from "node:path";

import { loadReleaseBundle, type LoadedReleaseBundleV3 } from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createRouteDispositionArtifact,
  type RouteDispositionArtifactSource,
} from "./route-disposition-artifact";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);

describe("route disposition artifact", () => {
  it("accepts the v3 release disposition structure", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<RouteDispositionArtifactSource>();
  });

  it("projects identity-bound provider-neutral route actions", () => {
    const artifact = createRouteDispositionArtifact({
      ...bundle,
      redirects: {
        items: [
          {
            type: "gone",
            path: "/retired",
            status: 410,
            replacementPath: null,
          },
          {
            type: "redirect",
            fromPath: "/old-about",
            toPath: "/about",
            status: 308,
          },
          {
            type: "redirect",
            fromPath: "/moved",
            toPath: "/archive",
            status: 301,
          },
        ],
      },
    });

    expect(artifact).toEqual({
      schemaVersion: "1.0.0",
      release: {
        releaseId: "REL-2026-000042",
        siteId: "site-a",
        contractVersion: "2.0.0",
        bundleChecksum:
          "sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27",
      },
      items: [
        {
          action: "redirect",
          sourcePath: "/moved",
          targetPath: "/archive",
          status: 301,
        },
        {
          action: "redirect",
          sourcePath: "/old-about",
          targetPath: "/about",
          status: 308,
        },
        {
          action: "gone",
          sourcePath: "/retired",
          targetPath: null,
          status: 410,
        },
      ],
    });
  });

  it("preserves an empty disposition set", () => {
    expect(createRouteDispositionArtifact(bundle).items).toEqual([]);
  });
});
