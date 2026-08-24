import type {
  LoadedReleaseBundle,
  LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import {
  loadReleaseBundle,
  loadV3ReleaseBundle,
} from "@content-foundry/content-contract";
import type { ResponsiveImageAsset } from "@content-foundry/media";
import {
  BuildTargetConfigError,
  type BuildTargetConfig,
} from "@content-foundry/site-core";

import type { NicheComponentRegistry } from "../components/niche-component-block";
import { getGeneratedRoutes } from "./generated-routes";
import {
  createSiteNicheComponentRegistry,
  projectNicheComponentIds,
} from "./niche-component-registry";
import {
  createResponsiveImageAssetRegistry,
  type ResponsiveImageAssetRegistry,
} from "./responsive-image-asset-registry";
import { validateSiteRouteGraph } from "./validate-site-route-graph";

export interface SiteReleaseContext {
  readonly contractVersion: "2.0.0";
  readonly config: BuildTargetConfig;
  readonly bundle: LoadedReleaseBundle;
  readonly canonicalOrigin: string;
}

export interface ValidatedSiteReleaseV3 {
  readonly contractVersion: "3.0.0";
  readonly config: BuildTargetConfig;
  readonly bundle: LoadedReleaseBundleV3;
  readonly canonicalOrigin: string;
  readonly nicheComponents: NicheComponentRegistry;
}

export interface SiteReleaseContextV3 extends ValidatedSiteReleaseV3 {
  readonly mediaAssets: ResponsiveImageAssetRegistry;
}

export interface LoadSiteReleaseV3Options {
  readonly mediaAssets: Iterable<ResponsiveImageAsset>;
}

function validateCanonicalOrigin(config: BuildTargetConfig, origin: string) {
  const canonicalUrl = new URL(origin);
  if (canonicalUrl.origin !== origin) {
    throw new BuildTargetConfigError(
      `Bundle site origin must not contain a path: ${origin}`,
    );
  }
  if (config.mode === "production" && config.origin !== canonicalUrl.origin) {
    throw new BuildTargetConfigError(
      `Production origin does not match bundle origin: ${String(config.origin)}`,
    );
  }
  return canonicalUrl.origin;
}

export function loadSiteRelease(
  config: BuildTargetConfig,
): SiteReleaseContext {
  const bundle = validateSiteRouteGraph(
    loadReleaseBundle(config.releaseDirectory, {
      expectedSiteId: config.siteId,
    }),
  );
  return {
    contractVersion: "2.0.0",
    config,
    bundle,
    canonicalOrigin: validateCanonicalOrigin(config, bundle.site.origin),
  };
}

export function loadValidatedSiteReleaseV3(
  config: BuildTargetConfig,
): ValidatedSiteReleaseV3 {
  const nicheComponents = createSiteNicheComponentRegistry();
  const bundle = loadV3ReleaseBundle(config.releaseDirectory, {
    expectedSiteId: config.siteId,
    resolveConsumerContext: (candidate) => {
      validateSiteRouteGraph(candidate);
      return {
        generatedRoutes: getGeneratedRoutes(candidate),
        nicheComponentRegistry: projectNicheComponentIds(nicheComponents),
      };
    },
  });

  return {
    contractVersion: "3.0.0",
    config,
    bundle,
    canonicalOrigin: validateCanonicalOrigin(config, bundle.site.origin),
    nicheComponents,
  };
}

export function loadSiteReleaseV3(
  config: BuildTargetConfig,
  options: LoadSiteReleaseV3Options,
): SiteReleaseContextV3 {
  const validated = loadValidatedSiteReleaseV3(config);
  return bindValidatedSiteReleaseV3(validated, options.mediaAssets);
}

export function bindValidatedSiteReleaseV3(
  validated: ValidatedSiteReleaseV3,
  mediaAssets: Iterable<ResponsiveImageAsset>,
): SiteReleaseContextV3 {
  return {
    ...validated,
    mediaAssets: createResponsiveImageAssetRegistry(
      validated.bundle.mediaManifest,
      mediaAssets,
    ),
  };
}
