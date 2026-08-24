import { hasValidManualAdUnits, type AdvertisingProviderConfig } from "@content-foundry/advertising";
import type { ReleaseMode } from "@content-foundry/site-core";

import { isArticleAdvertisingEligible } from "./article-ad-eligibility";
import type { SiteLaunchAttestations } from "./site-launch-attestations";
import { SiteLaunchReadinessError } from "./site-launch-readiness-error";

export interface SiteLaunchAdvertisingSource {
  readonly config: { readonly adsEnabled: boolean };
  readonly bundle: {
    readonly site: {
      readonly ads: {
        readonly provider: "disabled" | "adsense" | "other";
        readonly enabled: boolean;
        readonly publicClientId: string | null;
      };
    };
    readonly articles: readonly {
      readonly advertising: { readonly enabled: boolean };
    }[];
  };
}

export function validateSiteLaunchAdDeliveryPolicy(
  mode: ReleaseMode,
  source: SiteLaunchAdvertisingSource,
  advertising: AdvertisingProviderConfig,
  attestations: SiteLaunchAttestations,
): void {
  if (mode !== "production") return;

  const enabled = advertising.provider === "adsense";
  const issues: string[] = [];
  if (source.config.adsEnabled !== enabled) {
    issues.push("effective advertising must match the production build request");
  }
  if (!enabled) {
    if (issues.length > 0) throw new SiteLaunchReadinessError(issues);
    return;
  }
  if (advertising.publicClientId !== source.bundle.site.ads.publicClientId) {
    issues.push("effective AdSense client must match the release");
  }
  if (!hasValidManualAdUnits(advertising.manualUnits)) {
    issues.push("enabled advertising requires valid manual units");
  }
  if (attestations.adsenseSiteReady !== true) {
    issues.push("ADSENSE_SITE_READY must be true when advertising is enabled");
  }
  const eligibilityContext = {
    config: source.config,
    site: source.bundle.site,
  };
  if (!source.bundle.articles.some(
    (article) => isArticleAdvertisingEligible(eligibilityContext, article),
  )) {
    issues.push("enabled advertising requires at least one eligible article");
  }

  if (issues.length > 0) throw new SiteLaunchReadinessError(issues);
}
