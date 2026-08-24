import "server-only";

import { loadPreparedSiteRelease } from "./load-prepared-site-release";
import type { PreparedVersionedSiteReleaseContext } from "./load-site-release";
import { resolveSiteBuildArtifactPaths } from "./site-build-artifact-paths";
import { resolveSiteBuildConfig } from "./site-build-config";

let cachedVersionedContext: PreparedVersionedSiteReleaseContext | undefined;

export function getVersionedSiteReleaseContext(): PreparedVersionedSiteReleaseContext {
  cachedVersionedContext ??= loadPreparedSiteRelease(
    resolveSiteBuildConfig(process.env),
    resolveSiteBuildArtifactPaths(process.cwd()),
  );
  return cachedVersionedContext;
}
