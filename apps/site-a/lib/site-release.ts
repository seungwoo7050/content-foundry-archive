import "server-only";

import { loadPreparedSiteRelease } from "./load-prepared-site-release";
import {
  loadSiteRelease,
  type SiteReleaseContext,
  type VersionedSiteReleaseContext,
} from "./load-site-release";
import { resolveSiteBuildArtifactPaths } from "./site-build-artifact-paths";
import { resolveSiteBuildConfig } from "./site-build-config";

let cachedContext: SiteReleaseContext | undefined;
let cachedVersionedContext: VersionedSiteReleaseContext | undefined;

export function getSiteReleaseContext(): SiteReleaseContext {
  cachedContext ??= loadSiteRelease(resolveSiteBuildConfig(process.env));
  return cachedContext;
}

export function getVersionedSiteReleaseContext(): VersionedSiteReleaseContext {
  cachedVersionedContext ??= loadPreparedSiteRelease(
    resolveSiteBuildConfig(process.env),
    resolveSiteBuildArtifactPaths(process.cwd()),
  );
  return cachedVersionedContext;
}
