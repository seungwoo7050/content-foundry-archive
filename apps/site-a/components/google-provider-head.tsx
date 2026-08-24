import {
  AnalyticsConfigError,
  type AnalyticsProviderConfig,
} from "@content-foundry/analytics";

import type { SiteGoogleCmpConfig } from "../lib/site-google-cmp-config";
import { AdSenseBootstrap } from "./adsense-bootstrap";
import { Ga4Tag } from "./ga4-tag";
import { GoogleConsentDefaults } from "./google-consent-defaults";

export function GoogleProviderHead({
  analytics,
  cmp,
}: {
  readonly analytics: AnalyticsProviderConfig;
  readonly cmp: SiteGoogleCmpConfig;
}) {
  if (analytics.provider === "ga4" && cmp.provider !== "google-cmp") {
    throw new AnalyticsConfigError("GA4 rendering requires Google CMP");
  }
  return (
    <>
      {cmp.provider === "google-cmp" ? <GoogleConsentDefaults /> : null}
      <AdSenseBootstrap publicClientId={cmp.publicClientId} />
      <Ga4Tag config={analytics} />
    </>
  );
}
