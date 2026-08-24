import "server-only";

import { loadPreparedSiteRelease } from "./load-prepared-site-release";
import type { VersionedSiteReleaseContext } from "./load-site-release";
import { resolveSiteBuildArtifactPaths } from "./site-build-artifact-paths";
import { resolveSiteBuildConfig } from "./site-build-config";

let cachedVersionedContext: VersionedSiteReleaseContext | undefined;

export function getVersionedSiteReleaseContext(): VersionedSiteReleaseContext {
  cachedVersionedContext ??= loadPreparedSiteRelease(
    resolveSiteBuildConfig(process.env),
    resolveSiteBuildArtifactPaths(process.cwd()),
  );
  return cachedVersionedContext;
}
