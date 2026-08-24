import {
  createAdsTxtRecord,
} from "@content-foundry/advertising";
import type { AnalyticsProviderConfig } from "@content-foundry/analytics";
import type { ConsentBuildConfig, ReleaseMode } from "@content-foundry/site-core";

import type { SiteGoogleCmpConfig } from "./site-google-cmp-config";
import type { SiteLaunchAttestations } from "./site-launch-attestations";
import { SiteLaunchReadinessError } from "./site-launch-readiness-error";

export interface SiteLaunchGooglePolicyInput {
  readonly mode: ReleaseMode;
  readonly consent: ConsentBuildConfig;
  readonly analytics: AnalyticsProviderConfig;
  readonly cmp: SiteGoogleCmpConfig;
  readonly adsTxtRecord: string | null;
  readonly attestations: SiteLaunchAttestations;
}

export function validateSiteLaunchGooglePolicy(
  input: SiteLaunchGooglePolicyInput,
): void {
  if (input.mode !== "production") return;

  const issues: string[] = [];
  const consentEnabled = input.consent.provider === "google-cmp";
  const cmpEnabled = input.cmp.provider === "google-cmp";
  const analyticsEnabled = input.analytics.provider === "ga4";
  if (consentEnabled !== cmpEnabled) {
    issues.push("Google CMP publication must match the consent provider");
  }
  if (analyticsEnabled && !consentEnabled) {
    issues.push("GA4 requires Google CMP consent");
  }
  if (
    (analyticsEnabled || cmpEnabled)
    && input.attestations.googleCmpReady !== true
  ) {
    issues.push("GOOGLE_CMP_READY must be true");
  }
  if (
    analyticsEnabled
    && input.attestations.ownedGa4MeasurementId
      !== input.analytics.publicMeasurementId
  ) {
    issues.push("SITE_OWNED_GA4_MEASUREMENT_ID must match the release");
  }

  if (cmpEnabled) {
    if (
      input.attestations.ownedAdSenseClientId !== input.cmp.publicClientId
    ) {
      issues.push("SITE_OWNED_ADSENSE_CLIENT_ID must match the release");
    }
    if (input.attestations.adsenseAutoAdsEnabled !== false) {
      issues.push("ADSENSE_AUTO_ADS_ENABLED must be false");
    }
    if (input.adsTxtRecord !== createAdsTxtRecord(input.cmp.publicClientId)) {
      issues.push("ads.txt record must match the owned AdSense client");
    }
  } else if (input.adsTxtRecord !== null) {
    issues.push("ads.txt record is forbidden without Google CMP publication");
  }

  if (issues.length > 0) throw new SiteLaunchReadinessError(issues);
}
