import type { VersionedSiteReleaseContext } from "./load-site-release";
import { validateSiteLaunchAdDeliveryPolicy } from "./site-launch-ad-delivery-policy";
import type { SiteLaunchAttestations } from "./site-launch-attestations";
import { validateSiteLaunchContent } from "./site-launch-content-policy";
import { validateSiteLaunchGooglePolicy } from "./site-launch-google-policy";
import { validateSiteLaunchOrigin } from "./site-launch-origin-policy";
import { SiteLaunchReadinessError } from "./site-launch-readiness-error";
import type { SiteProviderConfig } from "./site-provider-config";
import { createThemeShellViewModel } from "./theme-shell-view-model";

export function validateSiteLaunchReadiness(
  context: VersionedSiteReleaseContext,
  providers: SiteProviderConfig,
  attestations: SiteLaunchAttestations,
): void {
  const footerNavigation = createThemeShellViewModel(context.bundle)
    .footerNavigation ?? [];
  const checks = [
    () => validateSiteLaunchOrigin(context.config.mode, context.config.origin),
    () => validateSiteLaunchContent(
      context.config.mode,
      context.bundle,
      footerNavigation,
    ),
    () => validateSiteLaunchGooglePolicy({
      mode: context.config.mode,
      consent: providers.consent,
      analytics: providers.analytics,
      cmp: providers.cmp,
      adsTxtRecord: providers.adsTxtRecord,
      attestations,
    }),
    () => validateSiteLaunchAdDeliveryPolicy(
      context.config.mode,
      context,
      providers.advertising,
      attestations,
    ),
  ];
  const issues: string[] = [];
  for (const check of checks) {
    try {
      check();
    } catch (error) {
      if (!(error instanceof SiteLaunchReadinessError)) throw error;
      issues.push(...error.issues);
    }
  }
  if (issues.length > 0) throw new SiteLaunchReadinessError(issues);
}
