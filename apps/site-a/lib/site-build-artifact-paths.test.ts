import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { resolveSiteBuildArtifactPaths } from "./site-build-artifact-paths";

describe("resolveSiteBuildArtifactPaths", () => {
  it("pins private projections and public media beneath the app directory", () => {
    const appDirectory = resolve("/workspace/apps/site-a");

    expect(resolveSiteBuildArtifactPaths(appDirectory)).toEqual({
      projectionPath: resolve(
        "/workspace/apps/site-a/.site-build/media-projection.json",
      ),
      publicDirectory: resolve("/workspace/apps/site-a/public"),
    });
  });
});
