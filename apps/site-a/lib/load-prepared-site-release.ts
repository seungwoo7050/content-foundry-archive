import type { BuildTargetConfig } from "@content-foundry/site-core";

import {
  bindValidatedSiteReleaseV3,
  loadValidatedSiteRelease,
  type VersionedSiteReleaseContext,
} from "./load-site-release";
import { readSiteMediaProjection } from "./site-media-projection";

export interface LoadPreparedSiteReleaseOptions {
  readonly projectionPath: string;
}

export function loadPreparedSiteRelease(
  config: BuildTargetConfig,
  options: LoadPreparedSiteReleaseOptions,
): VersionedSiteReleaseContext {
  const validated = loadValidatedSiteRelease(config);
  if (validated.contractVersion === "2.0.0") return validated;

  const mediaAssets = readSiteMediaProjection(
    options.projectionPath,
    validated.bundle,
  );
  return bindValidatedSiteReleaseV3(validated, mediaAssets);
}
