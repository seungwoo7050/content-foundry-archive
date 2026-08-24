import type {
  LoadedReleaseBundle,
  LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import { AnalyticsConfigError } from "@content-foundry/analytics";
import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  SiteReleaseContext,
  SiteReleaseContextV3,
} from "./load-site-release";
import {
  resolveSiteAnalyticsConfig,
  type SiteAnalyticsSource,
} from "./site-analytics-config";

const disabledContext = {
  config: { analyticsEnabled: false },
  bundle: {
    site: {
      analytics: { provider: "disabled", publicMeasurementId: null },
    },
  },
} as const;
const googleConsent = {
  provider: "google-cmp",
  configRevision: "consent-r1",
} as const;

describe("Site A analytics configuration", () => {
  it("accepts both release contexts through a narrow public boundary", () => {
    expectTypeOf<SiteReleaseContext>().toExtend<SiteAnalyticsSource>();
    expectTypeOf<SiteReleaseContextV3>().toExtend<SiteAnalyticsSource>();
    expectTypeOf<LoadedReleaseBundle["site"]["analytics"]>()
      .toExtend<SiteAnalyticsSource["bundle"]["site"]["analytics"]>();
    expectTypeOf<LoadedReleaseBundleV3["site"]["analytics"]>()
      .toExtend<SiteAnalyticsSource["bundle"]["site"]["analytics"]>();
  });

  it("keeps template or preview analytics disabled without consent", () => {
    expect(resolveSiteAnalyticsConfig(disabledContext, {
      provider: "disabled",
      configRevision: null,
    })).toEqual({ provider: "disabled", publicMeasurementId: null });
  });

  it("enables a valid release GA4 identity only with Google CMP", () => {
    const context = {
      config: { analyticsEnabled: true },
      bundle: {
        site: {
          analytics: {
            provider: "ga4",
            publicMeasurementId: "G-PSW1MY7HB4",
          },
        },
      },
    } as const;

    expect(resolveSiteAnalyticsConfig(context, googleConsent)).toEqual({
      provider: "ga4",
      publicMeasurementId: "G-PSW1MY7HB4",
    });
    expect(() => resolveSiteAnalyticsConfig(context, {
      provider: "disabled",
      configRevision: null,
    })).toThrow("requires google-cmp consent");
  });

  it("rejects an enabled build whose release identity is disabled", () => {
    expect(() => resolveSiteAnalyticsConfig({
      ...disabledContext,
      config: { analyticsEnabled: true },
    }, googleConsent)).toThrow(AnalyticsConfigError);
  });

  it("retains strict shared validation for malformed enabled identity", () => {
    expect(() => resolveSiteAnalyticsConfig({
      config: { analyticsEnabled: true },
      bundle: {
        site: {
          analytics: {
            provider: "ga4",
            publicMeasurementId: "G-invalid",
          },
        },
      },
    }, googleConsent)).toThrow("valid public measurement ID");
  });
});
