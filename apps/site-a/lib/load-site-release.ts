import type { LoadedReleaseBundle } from "@content-foundry/content-contract";
import { loadReleaseBundle } from "@content-foundry/content-contract";
import {
  BuildTargetConfigError,
  type BuildTargetConfig,
} from "@content-foundry/site-core";

export interface SiteReleaseContext {
  readonly config: BuildTargetConfig;
  readonly bundle: LoadedReleaseBundle;
  readonly canonicalOrigin: string;
}

export function loadSiteRelease(
  config: BuildTargetConfig,
): SiteReleaseContext {
  const bundle = loadReleaseBundle(config.releaseDirectory, {
    expectedSiteId: config.siteId,
  });
  const canonicalUrl = new URL(bundle.site.origin);
  if (canonicalUrl.origin !== bundle.site.origin) {
    throw new BuildTargetConfigError(
      `Bundle site origin must not contain a path: ${bundle.site.origin}`,
    );
  }
  return {
    config,
    bundle,
    canonicalOrigin: canonicalUrl.origin,
  };
}
