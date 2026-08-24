import { describe, expect, it } from "vitest";

import { SiteLaunchReadinessError } from "./site-launch-readiness-error";
import {
  type SiteLaunchGooglePolicyInput,
  validateSiteLaunchGooglePolicy,
} from "./site-launch-google-policy";

const valid: SiteLaunchGooglePolicyInput = {
  mode: "production",
  consent: { provider: "google-cmp", configRevision: "cmp-r1" },
  analytics: { provider: "ga4", publicMeasurementId: "G-SITEA123" },
  cmp: {
    provider: "google-cmp",
    publicClientId: "ca-pub-1234567890123456",
  },
  adsTxtRecord: "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0",
  attestations: {
    ownedGa4MeasurementId: "G-SITEA123",
    ownedAdSenseClientId: "ca-pub-1234567890123456",
    googleCmpReady: true,
    adsenseAutoAdsEnabled: false,
    adsenseSiteReady: null,
  },
};

describe("Site A launch Google policy", () => {
  it("accepts owned consent-ready GA4 and AdSense publication", () => {
    expect(() => validateSiteLaunchGooglePolicy(valid)).not.toThrow();
  });

  it("allows review publication before advertising delivery is ready", () => {
    expect(() => validateSiteLaunchGooglePolicy({
      ...valid,
      analytics: { provider: "disabled", publicMeasurementId: null },
      attestations: { ...valid.attestations, ownedGa4MeasurementId: null },
    })).not.toThrow();
  });

  it.each(["template", "preview"] as const)(
    "does not apply production Google policy in %s",
    (mode) => expect(() => validateSiteLaunchGooglePolicy({
      ...valid,
      mode,
      adsTxtRecord: "forged",
    })).not.toThrow(),
  );

  it("aggregates provider consistency, readiness, ownership, and ads.txt", () => {
    const input: SiteLaunchGooglePolicyInput = {
      ...valid,
      consent: { provider: "disabled", configRevision: null },
      adsTxtRecord: "wrong",
      attestations: {
        ...valid.attestations,
        ownedGa4MeasurementId: null,
        ownedAdSenseClientId: null,
        googleCmpReady: false,
        adsenseAutoAdsEnabled: true,
      },
    };

    expect(() => validateSiteLaunchGooglePolicy(input)).toThrow(
      expect.objectContaining<Partial<SiteLaunchReadinessError>>({
        issues: [
          "Google CMP publication must match the consent provider",
          "GA4 requires Google CMP consent",
          "GOOGLE_CMP_READY must be true",
          "SITE_OWNED_GA4_MEASUREMENT_ID must match the release",
          "SITE_OWNED_ADSENSE_CLIENT_ID must match the release",
          "ADSENSE_AUTO_ADS_ENABLED must be false",
          "ads.txt record must match the owned AdSense client",
        ],
      }),
    );
  });
});
