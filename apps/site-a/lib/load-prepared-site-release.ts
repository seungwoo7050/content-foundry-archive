import type { BuildTargetConfig } from "@content-foundry/site-core";

import {
  bindValidatedSiteRelease,
  loadValidatedSiteRelease,
  type PreparedVersionedSiteReleaseContext,
} from "./load-site-release";
import { readSiteMediaProjection } from "./site-media-projection";

export interface LoadPreparedSiteReleaseOptions {
  readonly projectionPath: string;
}

export function loadPreparedSiteRelease(
  config: BuildTargetConfig,
  options: LoadPreparedSiteReleaseOptions,
): PreparedVersionedSiteReleaseContext {
  const validated = loadValidatedSiteRelease(config);
  const mediaAssets = readSiteMediaProjection(
    options.projectionPath,
    validated.bundle,
  );
  return bindValidatedSiteRelease(validated, mediaAssets);
}
