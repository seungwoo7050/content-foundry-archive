import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import type { BuildConfigChecksum } from "./build-config-checksum";
import { createReleaseBuildMetadata } from "./release-build-metadata";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const buildConfigChecksum: BuildConfigChecksum = `sha256:${"a".repeat(64)}`;

describe("release build metadata", () => {
  it("reports source-controlled compatibility and generated HTML count", () => {
    expect(createReleaseBuildMetadata(
      loadReleaseBundle(fixture),
      buildConfigChecksum,
    )).toEqual({
      releaseId: "REL-2026-000042",
      siteId: "site-a",
      contractVersion: "2.0.0",
      bundleChecksum:
        "sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27",
      buildConfigChecksum,
      supportedContractVersions: ["2.0.0", "3.0.0"],
      routeCount: 7,
    });
  });

  it("counts gone HTML without counting redirect actions", () => {
    const bundle = loadReleaseBundle(fixture);
    bundle.redirects.items.push(
      {
        type: "gone",
        path: "/retired-guide",
        status: 410,
        replacementPath: null,
      },
      {
        type: "redirect",
        fromPath: "/old-guide",
        toPath: "/about",
        status: 308,
      },
    );

    expect(createReleaseBuildMetadata(bundle, buildConfigChecksum).routeCount).toBe(8);
  });
});
