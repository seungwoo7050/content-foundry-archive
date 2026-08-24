import type {
  LoadedReleaseBundle,
  LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import {
  loadSupportedReleaseBundle,
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

export interface PreparedSiteReleaseContextV2 extends SiteReleaseContext {
  readonly mediaAssets: ResponsiveImageAssetRegistry;
}

export interface SiteReleaseContextByVersion {
  readonly "2.0.0": SiteReleaseContext;
  readonly "3.0.0": SiteReleaseContextV3;
}

export type VersionedSiteReleaseContext =
  SiteReleaseContextByVersion[keyof SiteReleaseContextByVersion];

export interface PreparedSiteReleaseContextByVersion {
  readonly "2.0.0": PreparedSiteReleaseContextV2;
  readonly "3.0.0": SiteReleaseContextV3;
}

export type PreparedVersionedSiteReleaseContext =
  PreparedSiteReleaseContextByVersion[keyof PreparedSiteReleaseContextByVersion];

export type ValidatedVersionedSiteRelease =
  | SiteReleaseContext
  | ValidatedSiteReleaseV3;

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
  const context = loadValidatedSiteRelease(config);
  if (context.contractVersion === "2.0.0") return context;
  throw new BuildTargetConfigError("Expected a contract 2.0.0 site release");
}

export function loadValidatedSiteRelease(
  config: BuildTargetConfig,
): ValidatedVersionedSiteRelease {
  const nicheComponents = createSiteNicheComponentRegistry();
  const bundle = loadSupportedReleaseBundle(config.releaseDirectory, {
    expectedSiteId: config.siteId,
    resolveV3ConsumerContext: (candidate) => {
      validateSiteRouteGraph(candidate);
      return {
        generatedRoutes: getGeneratedRoutes(candidate),
        nicheComponentRegistry: projectNicheComponentIds(nicheComponents),
      };
    },
  });

  if (bundle.release.contractVersion === "2.0.0") {
    const validated = validateSiteRouteGraph(bundle as LoadedReleaseBundle);
    return {
      contractVersion: "2.0.0",
      config,
      bundle: validated,
      canonicalOrigin: validateCanonicalOrigin(config, validated.site.origin),
    };
  }

  return {
    contractVersion: "3.0.0",
    config,
    bundle: bundle as LoadedReleaseBundleV3,
    canonicalOrigin: validateCanonicalOrigin(config, bundle.site.origin),
    nicheComponents,
  };
}

export function loadValidatedSiteReleaseV3(
  config: BuildTargetConfig,
): ValidatedSiteReleaseV3 {
  const context = loadValidatedSiteRelease(config);
  if (context.contractVersion === "3.0.0") return context;
  throw new BuildTargetConfigError("Expected a contract 3.0.0 site release");
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
  return bindValidatedSiteRelease(validated, mediaAssets);
}

export function bindValidatedSiteRelease<
  T extends ValidatedVersionedSiteRelease,
>(
  validated: T,
  mediaAssets: Iterable<ResponsiveImageAsset>,
): T & { readonly mediaAssets: ResponsiveImageAssetRegistry } {
  return {
    ...validated,
    mediaAssets: createResponsiveImageAssetRegistry(
      validated.bundle.mediaManifest,
      mediaAssets,
    ),
  };
}
