import "server-only";

import { loadSiteRelease, type SiteReleaseContext } from "./load-site-release";
import { resolveSiteBuildConfig } from "./site-build-config";

let cachedContext: SiteReleaseContext | undefined;

export function getSiteReleaseContext(): SiteReleaseContext {
  cachedContext ??= loadSiteRelease(resolveSiteBuildConfig(process.env));
  return cachedContext;
}
