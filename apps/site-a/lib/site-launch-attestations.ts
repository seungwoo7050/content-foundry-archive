import {
  isAdSensePublicClientId,
  type AdSensePublicClientId,
} from "@content-foundry/advertising";
import {
  isGa4MeasurementId,
  type Ga4MeasurementId,
} from "@content-foundry/analytics";
import { BuildTargetConfigError, type ReleaseMode } from "@content-foundry/site-core";

export interface SiteLaunchAttestations {
  readonly ownedGa4MeasurementId: Ga4MeasurementId | null;
  readonly ownedAdSenseClientId: AdSensePublicClientId | null;
  readonly googleCmpReady: boolean | null;
  readonly adsenseAutoAdsEnabled: boolean | null;
  readonly adsenseSiteReady: boolean | null;
}

const disabledAttestations: SiteLaunchAttestations = Object.freeze({
  ownedGa4MeasurementId: null,
  ownedAdSenseClientId: null,
  googleCmpReady: null,
  adsenseAutoAdsEnabled: null,
  adsenseSiteReady: null,
});

const fail = (message: string): never => {
  throw new BuildTargetConfigError(message);
};

function readBoolean(name: string, value: string | undefined): boolean | null {
  if (value === undefined) return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return fail(`${name} must be true or false`);
}

export function resolveSiteLaunchAttestations(
  mode: ReleaseMode,
  environment: Readonly<Record<string, string | undefined>>,
): SiteLaunchAttestations {
  if (mode !== "production") return disabledAttestations;

  const ownedGa4MeasurementId = environment.SITE_OWNED_GA4_MEASUREMENT_ID;
  if (
    ownedGa4MeasurementId !== undefined
    && !isGa4MeasurementId(ownedGa4MeasurementId)
  ) {
    return fail("SITE_OWNED_GA4_MEASUREMENT_ID is invalid");
  }
  const ownedAdSenseClientId = environment.SITE_OWNED_ADSENSE_CLIENT_ID;
  if (
    ownedAdSenseClientId !== undefined
    && !isAdSensePublicClientId(ownedAdSenseClientId)
  ) {
    return fail("SITE_OWNED_ADSENSE_CLIENT_ID is invalid");
  }

  return Object.freeze({
    ownedGa4MeasurementId: ownedGa4MeasurementId ?? null,
    ownedAdSenseClientId: ownedAdSenseClientId ?? null,
    googleCmpReady: readBoolean("GOOGLE_CMP_READY", environment.GOOGLE_CMP_READY),
    adsenseAutoAdsEnabled: readBoolean(
      "ADSENSE_AUTO_ADS_ENABLED",
      environment.ADSENSE_AUTO_ADS_ENABLED,
    ),
    adsenseSiteReady: readBoolean(
      "ADSENSE_SITE_READY",
      environment.ADSENSE_SITE_READY,
    ),
  });
}
