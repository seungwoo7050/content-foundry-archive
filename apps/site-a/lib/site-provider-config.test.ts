import { describe, expect, it } from "vitest";

import { resolveSiteProviderConfig } from "./site-provider-config";

const source = {
  config: { mode: "production", adsEnabled: true, analyticsEnabled: true },
  bundle: {
    site: {
      ads: {
        provider: "adsense",
        enabled: true,
        publicClientId: "ca-pub-1234567890123456",
      },
      analytics: { provider: "ga4", publicMeasurementId: "G-SITEA123" },
      defaultTheme: "friendly-mobile-utility",
    },
  },
} as const;

describe("Site A effective provider configuration", () => {
  it.each(["template", "preview"] as const)(
    "normalizes %s to an identity-free provider configuration",
    (mode) => {
      const config = resolveSiteProviderConfig({
        ...source,
        config: { mode, adsEnabled: false, analyticsEnabled: false },
      }, {
        CONSENT_PROVIDER: "invalid",
        ADSENSE_MANUAL_UNITS: "invalid",
      });

      expect(config).toEqual({
        consent: { provider: "disabled", configRevision: null },
        analytics: { provider: "disabled", publicMeasurementId: null },
        advertising: {
          provider: "disabled",
          enabled: false,
          publicClientId: null,
          manualUnits: {},
        },
        cmp: { provider: "disabled", publicClientId: null },
        adsTxtRecord: null,
      });
      expect(Object.isFrozen(config)).toBe(true);
    },
  );

  it("resolves one internally consistent production configuration", () => {
    expect(resolveSiteProviderConfig(source, {
      CONSENT_PROVIDER: "google-cmp",
      CONSENT_CONFIG_REVISION: "cmp-r1",
      ADSENSE_MANUAL_UNITS: '{"home-feed":"123","article-end":"456"}',
    })).toEqual({
      consent: { provider: "google-cmp", configRevision: "cmp-r1" },
      analytics: { provider: "ga4", publicMeasurementId: "G-SITEA123" },
      advertising: {
        provider: "adsense",
        enabled: true,
        publicClientId: "ca-pub-1234567890123456",
        manualUnits: { "home-feed": "123", "article-end": "456" },
      },
      cmp: {
        provider: "google-cmp",
        publicClientId: "ca-pub-1234567890123456",
      },
      adsTxtRecord: "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0",
    });
  });

  it("fails production closed before returning a partial configuration", () => {
    expect(() => resolveSiteProviderConfig(source, {
      CONSENT_PROVIDER: "disabled",
      ADSENSE_MANUAL_UNITS: '{"home-feed":"123"}',
    })).toThrow("requires google-cmp consent");
  });
});
