import type { BuildTargetConfig } from "@content-foundry/site-core";

import {
  bindValidatedSiteReleaseV3,
  loadSiteRelease,
  loadValidatedSiteReleaseV3,
  type VersionedSiteReleaseContext,
} from "./load-site-release";
import { readSiteMediaProjection } from "./site-media-projection";
import { declaresV3SiteRelease } from "./site-release-version";

export interface LoadPreparedSiteReleaseOptions {
  readonly projectionPath: string;
}

export function loadPreparedSiteRelease(
  config: BuildTargetConfig,
  options: LoadPreparedSiteReleaseOptions,
): VersionedSiteReleaseContext {
  if (!declaresV3SiteRelease(config.releaseDirectory)) {
    return loadSiteRelease(config);
  }

  const validated = loadValidatedSiteReleaseV3(config);
  const mediaAssets = readSiteMediaProjection(
    options.projectionPath,
    validated.bundle,
  );
  return bindValidatedSiteReleaseV3(validated, mediaAssets);
}
