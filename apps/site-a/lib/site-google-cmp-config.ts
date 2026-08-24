import {
  AdvertisingConfigError,
  isAdSensePublicClientId,
  type AdSensePublicClientId,
} from "@content-foundry/advertising";
import type { ConsentBuildConfig } from "@content-foundry/site-core";

export type SiteGoogleCmpConfig =
  | { readonly provider: "disabled"; readonly publicClientId: null }
  | {
      readonly provider: "google-cmp";
      readonly publicClientId: AdSensePublicClientId;
    };

const disabledConfig: SiteGoogleCmpConfig = Object.freeze({
  provider: "disabled",
  publicClientId: null,
});

export function resolveSiteGoogleCmpConfig(
  production: boolean,
  consent: ConsentBuildConfig,
  releaseAdsIdentity: unknown,
): SiteGoogleCmpConfig {
  if (!production || consent.provider === "disabled") return disabledConfig;
  if (
    typeof releaseAdsIdentity !== "object"
    || releaseAdsIdentity === null
    || Array.isArray(releaseAdsIdentity)
  ) {
    throw new AdvertisingConfigError(
      "google-cmp requires a release AdSense identity",
    );
  }
  const identity = releaseAdsIdentity as Record<string, unknown>;
  if (Object.keys(identity).sort().join(",") !== "enabled,provider,publicClientId") {
    throw new AdvertisingConfigError(
      "google-cmp release AdSense identity must have an exact public shape",
    );
  }
  if (
    identity.provider !== "adsense"
    || !isAdSensePublicClientId(identity.publicClientId)
  ) {
    throw new AdvertisingConfigError(
      "google-cmp requires a valid release AdSense public client ID",
    );
  }
  return {
    provider: "google-cmp",
    publicClientId: identity.publicClientId,
  };
}
