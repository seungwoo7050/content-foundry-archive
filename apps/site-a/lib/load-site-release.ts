import type { LoadedReleaseBundle } from "@content-foundry/content-contract";
import { loadReleaseBundle } from "@content-foundry/content-contract";
import {
  BuildTargetConfigError,
  type BuildTargetConfig,
} from "@content-foundry/site-core";

import { validateSiteRouteGraph } from "./validate-site-route-graph";

export interface SiteReleaseContext {
  readonly config: BuildTargetConfig;
  readonly bundle: LoadedReleaseBundle;
  readonly canonicalOrigin: string;
}

export function loadSiteRelease(
  config: BuildTargetConfig,
): SiteReleaseContext {
  const bundle = validateSiteRouteGraph(
    loadReleaseBundle(config.releaseDirectory, {
      expectedSiteId: config.siteId,
    }),
  );
  const canonicalUrl = new URL(bundle.site.origin);
  if (canonicalUrl.origin !== bundle.site.origin) {
    throw new BuildTargetConfigError(
      `Bundle site origin must not contain a path: ${bundle.site.origin}`,
    );
  }
  if (
    config.mode === "production" &&
    config.origin !== canonicalUrl.origin
  ) {
    throw new BuildTargetConfigError(
      `Production origin does not match bundle origin: ${String(config.origin)}`,
    );
  }

  return {
    config,
    bundle,
    canonicalOrigin: canonicalUrl.origin,
  };
}
