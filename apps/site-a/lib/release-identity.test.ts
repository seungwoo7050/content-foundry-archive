import { resolve } from "node:path";

import {
  loadReleaseBundle,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { describe, expect, expectTypeOf, it } from "vitest";

import {
  createReleaseIdentity,
  createReleaseIdentityMetadata,
  type ReleaseIdentitySource,
} from "./release-identity";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);

describe("release identity", () => {
  it("accepts the v3 release identity structure", () => {
    expectTypeOf<LoadedReleaseBundleV3>().toExtend<ReleaseIdentitySource>();
  });

  it("projects the four public release fields", () => {
    const identity = createReleaseIdentity(loadReleaseBundle(fixture));

    expect(identity).toEqual({
      releaseId: "REL-2026-000042",
      siteId: "site-a",
      contractVersion: "2.0.0",
      bundleChecksum:
        "sha256:0a8f03190b0a5d63fefc52e3efab08080a08263a6c8d716f0e4936382eee6f27",
    });
    expect(createReleaseIdentityMetadata(identity)).toMatchObject({
      "content-foundry-release-id": "REL-2026-000042",
      "content-foundry-contract-version": "2.0.0",
    });
  });
});
