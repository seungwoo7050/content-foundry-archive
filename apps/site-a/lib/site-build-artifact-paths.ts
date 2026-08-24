import { join, resolve } from "node:path";

import type { SiteBuildArtifactPaths } from "./prepare-site-build";

export function resolveSiteBuildArtifactPaths(
  appDirectory: string,
): SiteBuildArtifactPaths {
  const root = resolve(appDirectory);
  return {
    dispositionPath: join(root, ".site-build/route-dispositions.json"),
    projectionPath: join(root, ".site-build/media-projection.json"),
    publicDirectory: join(root, "public"),
  };
}
