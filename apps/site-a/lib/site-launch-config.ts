import type { VersionedSiteReleaseContext } from "./load-site-release";
import {
  resolveSiteLaunchAttestations,
  type SiteLaunchAttestations,
} from "./site-launch-attestations";
import { validateSiteLaunchReadiness } from "./site-launch-readiness";
import {
  resolveSiteProviderConfig,
  type SiteProviderConfig,
} from "./site-provider-config";

export interface SiteLaunchConfig extends SiteProviderConfig {
  readonly attestations: SiteLaunchAttestations;
  readonly analyticsOwnershipVerified: boolean;
  readonly advertisingOwnershipVerified: boolean;
}

export function resolveSiteLaunchConfig(
  context: VersionedSiteReleaseContext,
  environment: Readonly<Record<string, string | undefined>>,
): SiteLaunchConfig {
  const providers = resolveSiteProviderConfig(context, environment);
  const attestations = resolveSiteLaunchAttestations(
    context.config.mode,
    environment,
  );
  validateSiteLaunchReadiness(context, providers, attestations);

  return Object.freeze({
    ...providers,
    attestations,
    analyticsOwnershipVerified:
      providers.analytics.provider === "ga4"
      && attestations.ownedGa4MeasurementId
        === providers.analytics.publicMeasurementId,
    advertisingOwnershipVerified:
      providers.cmp.provider === "google-cmp"
      && attestations.ownedAdSenseClientId === providers.cmp.publicClientId,
  });
}
