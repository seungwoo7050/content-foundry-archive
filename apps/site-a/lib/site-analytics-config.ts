import {
  AnalyticsConfigError,
  resolveAnalyticsProviderConfig,
  type AnalyticsProviderConfig,
  type AnalyticsReleaseIdentity,
} from "@content-foundry/analytics";
import type { ConsentBuildConfig } from "@content-foundry/site-core";

export interface SiteAnalyticsSource {
  readonly config: { readonly analyticsEnabled: boolean };
  readonly bundle: {
    readonly site: { readonly analytics: AnalyticsReleaseIdentity };
  };
}

export function resolveSiteAnalyticsConfig(
  context: SiteAnalyticsSource,
  consent: ConsentBuildConfig,
): AnalyticsProviderConfig {
  const config = resolveAnalyticsProviderConfig(
    context.config.analyticsEnabled,
    context.bundle.site.analytics,
  );
  if (context.config.analyticsEnabled && config.provider === "disabled") {
    throw new AnalyticsConfigError(
      "enabled Site A analytics requires a release GA4 identity",
    );
  }
  if (config.provider === "ga4" && consent.provider !== "google-cmp") {
    throw new AnalyticsConfigError(
      "enabled Site A analytics requires google-cmp consent",
    );
  }
  return config;
}
