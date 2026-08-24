import { describe, expect, it } from "vitest";

import { resolveSiteLaunchAttestations } from "./site-launch-attestations";

const productionEnvironment = {
  SITE_OWNED_GA4_MEASUREMENT_ID: "G-SITEA123",
  SITE_OWNED_ADSENSE_CLIENT_ID: "ca-pub-1234567890123456",
  GOOGLE_CMP_READY: "true",
  ADSENSE_AUTO_ADS_ENABLED: "false",
  ADSENSE_SITE_READY: "true",
} as const;

describe("Site A launch attestations", () => {
  it.each(["template", "preview"] as const)(
    "normalizes %s inputs to a provider-free value",
    (mode) => {
      const first = resolveSiteLaunchAttestations(mode, {
        ...productionEnvironment,
        GOOGLE_CMP_READY: "not-a-boolean",
      });
      const second = resolveSiteLaunchAttestations(mode, {});

      expect(first).toBe(second);
      expect(first).toEqual({
        ownedGa4MeasurementId: null,
        ownedAdSenseClientId: null,
        googleCmpReady: null,
        adsenseAutoAdsEnabled: null,
        adsenseSiteReady: null,
      });
      expect(Object.isFrozen(first)).toBe(true);
    },
  );

  it("accepts exact production IDs and boolean attestations", () => {
    expect(resolveSiteLaunchAttestations(
      "production",
      productionEnvironment,
    )).toEqual({
      ownedGa4MeasurementId: "G-SITEA123",
      ownedAdSenseClientId: "ca-pub-1234567890123456",
      googleCmpReady: true,
      adsenseAutoAdsEnabled: false,
      adsenseSiteReady: true,
    });
  });

  it.each([
    "GOOGLE_CMP_READY",
    "ADSENSE_AUTO_ADS_ENABLED",
    "ADSENSE_SITE_READY",
  ])("rejects a non-boolean %s", (name) => {
    expect(() => resolveSiteLaunchAttestations("production", {
      ...productionEnvironment,
      [name]: "yes",
    })).toThrow(`${name} must be true or false`);
  });

  it.each([
    ["SITE_OWNED_GA4_MEASUREMENT_ID", "G-invalid"],
    ["SITE_OWNED_ADSENSE_CLIENT_ID", "ca-pub-123"],
  ])("rejects invalid public identity %s", (name, value) => {
    expect(() => resolveSiteLaunchAttestations("production", {
      ...productionEnvironment,
      [name]: value,
    })).toThrow(`${name} is invalid`);
  });
});
