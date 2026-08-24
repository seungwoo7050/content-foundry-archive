import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { describe, expect, it } from "vitest";

import { createReleaseBuildMetadata } from "./release-build-metadata";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);

describe("release build metadata", () => {
  it("reports source-controlled compatibility and generated HTML count", () => {
    expect(createReleaseBuildMetadata(loadReleaseBundle(fixture))).toEqual({
      releaseId: "REL-2026-000042",
      siteId: "site-a",
      contractVersion: "2.0.0",
      bundleChecksum:
        "sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27",
      supportedContractVersions: ["2.0.0", "3.0.0"],
      routeCount: 6,
    });
  });
});
