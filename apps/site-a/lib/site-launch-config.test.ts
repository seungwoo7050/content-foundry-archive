import type { BuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, it } from "vitest";

import { loadSiteRelease } from "./load-site-release";
import { resolveSiteBuildConfig } from "./site-build-config";
import { resolveSiteLaunchConfig } from "./site-launch-config";

const templateContext = loadSiteRelease(resolveSiteBuildConfig({}));

describe("Site A launch configuration", () => {
  it("returns one provider-free template configuration", () => {
    const config = resolveSiteLaunchConfig(templateContext, {
      CONSENT_PROVIDER: "invalid",
      GOOGLE_CMP_READY: "invalid",
      SITE_OWNED_ADSENSE_CLIENT_ID: "invalid",
    });

    expect(config).toMatchObject({
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
      analyticsOwnershipVerified: false,
      advertisingOwnershipVerified: false,
    });
    expect(config.attestations).toEqual({
      ownedGa4MeasurementId: null,
      ownedAdSenseClientId: null,
      googleCmpReady: null,
      adsenseAutoAdsEnabled: null,
      adsenseSiteReady: null,
    });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it("connects current production blockers to configuration resolution", () => {
    const productionConfig: BuildTargetConfig = {
      ...templateContext.config,
      mode: "production",
      origin: templateContext.canonicalOrigin,
      noindex: false,
    };

    expect(() => resolveSiteLaunchConfig({
      ...templateContext,
      config: productionConfig,
    }, {})).toThrow("production origin must not use reserved hostname example.com");
  });
});
