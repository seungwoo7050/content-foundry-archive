import { describe, expect, it } from "vitest";

import {
  createBuildConfigChecksum,
  createBuildConfigChecksumMetadata,
} from "./build-config-checksum";
import { loadSiteRelease } from "./load-site-release";
import { resolveSiteBuildConfig } from "./site-build-config";
import { resolveSiteLaunchConfig } from "./site-launch-config";

const context = loadSiteRelease(resolveSiteBuildConfig({}));
const source = {
  config: context.config,
  launch: resolveSiteLaunchConfig(context, {}),
};

describe("public build configuration checksum", () => {
  it("is a deterministic lowercase SHA-256 independent of local paths", () => {
    const checksum = createBuildConfigChecksum(source);
    const movedConfig = {
      ...source.config,
      releaseDirectory: "/a/different/local/release/path",
    };
    const moved = createBuildConfigChecksum({
      ...source,
      config: movedConfig,
    });

    expect(checksum).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(moved).toBe(checksum);
    expect(createBuildConfigChecksum(source)).toBe(checksum);
    expect(createBuildConfigChecksumMetadata(checksum)).toEqual({
      "content-foundry-build-config-checksum": checksum,
    });
  });

  it("changes when an effective build fact changes", () => {
    expect(createBuildConfigChecksum({
      ...source,
      config: { ...source.config, noindex: false },
    })).not.toBe(createBuildConfigChecksum(source));
  });
});
