import {
  createAdsTxtRecord, MANUAL_AD_UNITS_INPUT_NAME,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";
import type { AnalyticsProviderConfig, AnalyticsReleaseIdentity } from "@content-foundry/analytics";
import {
  resolveConsentBuildConfig,
  type ConsentBuildConfig,
  type ReleaseMode,
} from "@content-foundry/site-core";
import type { ThemeId } from "@content-foundry/themes";

import { resolveSiteAdvertisingConfig } from "./site-advertising-config";
import { resolveSiteAnalyticsConfig } from "./site-analytics-config";
import {
  resolveSiteGoogleCmpConfig,
  type SiteGoogleCmpConfig,
} from "./site-google-cmp-config";

export interface SiteProviderSource {
  readonly config: {
    readonly mode: ReleaseMode;
    readonly adsEnabled: boolean;
    readonly analyticsEnabled: boolean;
  };
  readonly bundle: {
    readonly site: {
      readonly ads: unknown;
      readonly analytics: AnalyticsReleaseIdentity;
      readonly defaultTheme: ThemeId;
    };
  };
}

export interface SiteProviderConfig {
  readonly consent: ConsentBuildConfig;
  readonly analytics: AnalyticsProviderConfig;
  readonly advertising: AdvertisingProviderConfig;
  readonly cmp: SiteGoogleCmpConfig;
  readonly adsTxtRecord: string | null;
}

export function resolveSiteProviderConfig(
  source: SiteProviderSource,
  environment: Readonly<Record<string, string | undefined>>,
): SiteProviderConfig {
  const production = source.config.mode === "production";
  const consent = resolveConsentBuildConfig(
    production ? environment : { CONSENT_PROVIDER: "disabled" },
  );
  const analytics = resolveSiteAnalyticsConfig(source, consent);
  const advertising = resolveSiteAdvertisingConfig(
    source,
    consent,
    environment[MANUAL_AD_UNITS_INPUT_NAME],
  );
  const cmp = resolveSiteGoogleCmpConfig(
    production,
    consent,
    source.bundle.site.ads,
  );

  return Object.freeze({
    consent,
    analytics,
    advertising,
    cmp,
    adsTxtRecord: cmp.provider === "google-cmp"
      ? createAdsTxtRecord(cmp.publicClientId)
      : null,
  });
}
