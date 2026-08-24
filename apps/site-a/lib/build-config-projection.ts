import { AD_SLOT_IDS } from "@content-foundry/advertising";
import type { BuildTargetConfig } from "@content-foundry/site-core";

import type { SiteLaunchConfig } from "./site-launch-config";

export const BUILD_CONFIG_SCHEMA_VERSION = "1.0.0" as const;

export interface BuildConfigProjectionSource {
  readonly config: Pick<
    BuildTargetConfig,
    | "siteId"
    | "mode"
    | "origin"
    | "noindex"
    | "analyticsEnabled"
    | "adsEnabled"
  >;
  readonly launch: SiteLaunchConfig;
}

export function createBuildConfigProjection(
  source: BuildConfigProjectionSource,
) {
  const { config, launch } = source;
  const cmpEnabled = launch.cmp.provider === "google-cmp";
  const analyticsEnabled = launch.analytics.provider === "ga4";
  const advertisingEnabled = launch.advertising.provider === "adsense";
  const manualUnits = advertisingEnabled
    ? AD_SLOT_IDS.flatMap((slotId) => {
        const unitId = launch.advertising.manualUnits[slotId];
        return unitId === undefined ? [] : [[slotId, unitId] as const];
      })
    : [];

  return {
    schemaVersion: BUILD_CONFIG_SCHEMA_VERSION,
    siteId: config.siteId,
    mode: config.mode,
    productionOrigin: config.mode === "production" ? config.origin : null,
    noindex: config.noindex,
    analyticsEnabled: config.analyticsEnabled,
    adsEnabled: config.adsEnabled,
    consent: {
      provider: launch.consent.provider,
      configRevision: launch.consent.configRevision,
    },
    analytics: {
      provider: launch.analytics.provider,
      publicMeasurementId: launch.analytics.publicMeasurementId,
    },
    advertising: {
      provider: launch.advertising.provider,
      enabled: advertisingEnabled,
      publicClientId: launch.advertising.publicClientId,
      manualUnits,
    },
    cmp: {
      provider: launch.cmp.provider,
      publicClientId: launch.cmp.publicClientId,
    },
    adsTxtRecord: launch.adsTxtRecord,
    googleCmpReady: analyticsEnabled || cmpEnabled
      ? launch.attestations.googleCmpReady
      : null,
    adsenseAutoAdsEnabled: cmpEnabled
      ? launch.attestations.adsenseAutoAdsEnabled
      : null,
    adsenseSiteReady: advertisingEnabled
      ? launch.attestations.adsenseSiteReady
      : null,
    analyticsOwnershipVerified: launch.analyticsOwnershipVerified,
    advertisingOwnershipVerified: launch.advertisingOwnershipVerified,
  } as const;
}
