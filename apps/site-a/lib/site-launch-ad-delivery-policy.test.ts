import { describe, expect, it } from "vitest";

import { SiteLaunchReadinessError } from "./site-launch-readiness-error";
import {
  type SiteLaunchAdvertisingSource,
  validateSiteLaunchAdDeliveryPolicy,
} from "./site-launch-ad-delivery-policy";

const source: SiteLaunchAdvertisingSource = {
  config: { adsEnabled: true },
  bundle: {
    site: {
      ads: {
        provider: "adsense",
        enabled: true,
        publicClientId: "ca-pub-1234567890123456",
      },
    },
    articles: [{ advertising: { enabled: true } }],
  },
};
const advertising = {
  provider: "adsense",
  enabled: true,
  publicClientId: "ca-pub-1234567890123456",
  manualUnits: { "article-end": "123" },
} as unknown as Parameters<
  typeof validateSiteLaunchAdDeliveryPolicy
>[2];
const attestations = {
  ownedGa4MeasurementId: null,
  ownedAdSenseClientId: "ca-pub-1234567890123456",
  googleCmpReady: true,
  adsenseAutoAdsEnabled: false,
  adsenseSiteReady: true,
} as const;

describe("Site A launch advertising delivery policy", () => {
  it("accepts an approved manual provider with an eligible article", () => {
    expect(() => validateSiteLaunchAdDeliveryPolicy(
      "production",
      source,
      advertising,
      attestations,
    )).not.toThrow();
  });

  it("allows production review with delivery disabled", () => {
    expect(() => validateSiteLaunchAdDeliveryPolicy(
      "production",
      { ...source, config: { adsEnabled: false } },
      { provider: "disabled", enabled: false, publicClientId: null, manualUnits: {} },
      { ...attestations, adsenseSiteReady: null },
    )).not.toThrow();
  });

  it.each(["template", "preview"] as const)(
    "does not apply production delivery policy in %s",
    (mode) => expect(() => validateSiteLaunchAdDeliveryPolicy(
      mode,
      { ...source, config: { adsEnabled: false } },
      advertising,
      { ...attestations, adsenseSiteReady: false },
    )).not.toThrow(),
  );

  it("aggregates request, identity, unit, approval, and eligibility failures", () => {
    expect(() => validateSiteLaunchAdDeliveryPolicy(
      "production",
      {
        config: { adsEnabled: false },
        bundle: {
          site: { ads: { provider: "adsense", enabled: false, publicClientId: null } },
          articles: [{ advertising: { enabled: false } }],
        },
      },
      { ...advertising, manualUnits: {} } as typeof advertising,
      { ...attestations, adsenseSiteReady: false },
    )).toThrow(expect.objectContaining<Partial<SiteLaunchReadinessError>>({
      issues: [
        "effective advertising must match the production build request",
        "effective AdSense client must match the release",
        "enabled advertising requires valid manual units",
        "ADSENSE_SITE_READY must be true when advertising is enabled",
        "enabled advertising requires at least one eligible article",
      ],
    }));
  });
});
