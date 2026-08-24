import { describe, expect, expectTypeOf, it } from "vitest";

import {
  ANALYTICS_PROVIDERS,
  AnalyticsConfigError,
  type AnalyticsProvider,
  type AnalyticsProviderConfig,
  type AnalyticsReleaseIdentity,
  isGa4MeasurementId,
  resolveAnalyticsProviderConfig,
} from "./ga4.js";

const releaseIdentity = {
  provider: "ga4",
  publicMeasurementId: "G-PSW1MY7HB4",
} satisfies AnalyticsReleaseIdentity;

describe("provider-neutral GA4 configuration", () => {
  it("exposes exact provider states and resolves matching production facts", () => {
    const config = resolveAnalyticsProviderConfig(true, releaseIdentity);

    expect(ANALYTICS_PROVIDERS).toEqual(["disabled", "ga4"]);
    expect(config).toEqual(releaseIdentity);
    expectTypeOf<AnalyticsProvider>().toEqualTypeOf<"disabled" | "ga4">();
    expectTypeOf(config).toEqualTypeOf<AnalyticsProviderConfig>();
  });

  it("keeps provider configuration disabled when the build flag is disabled", () => {
    const malformed = { provider: "ga4", publicMeasurementId: "not-an-id" };

    expect(resolveAnalyticsProviderConfig(false, releaseIdentity)).toEqual({
      provider: "disabled",
      publicMeasurementId: null,
    });
    expect(resolveAnalyticsProviderConfig(false, malformed as AnalyticsReleaseIdentity))
      .toEqual({ provider: "disabled", publicMeasurementId: null });
    expect(resolveAnalyticsProviderConfig(false, undefined)).toEqual({
      provider: "disabled",
      publicMeasurementId: null,
    });
  });

  it("preserves an explicitly disabled release identity", () => {
    expect(resolveAnalyticsProviderConfig(true, {
      provider: "disabled",
      publicMeasurementId: null,
    })).toEqual({ provider: "disabled", publicMeasurementId: null });
  });

  it.each([
    "G-A",
    `G-${"A1".repeat(16)}`,
    "G-PSW1MY7HB4",
  ])("accepts bounded uppercase ASCII measurement ID %s", (measurementId) => {
    expect(isGa4MeasurementId(measurementId)).toBe(true);
  });

  it.each([
    "G-",
    `G-${"A".repeat(33)}`,
    "g-PSW1MY7HB4",
    "G-psw1my7hb4",
    "G-PSW1-MY7HB4",
    "G-PSW1 MY7HB4",
    "G-ＰSW1MY7HB4",
    "AW-PSW1MY7HB4",
  ])("rejects malformed measurement ID %s", (measurementId) => {
    expect(isGa4MeasurementId(measurementId)).toBe(false);
    expect(() => resolveAnalyticsProviderConfig(true, {
      provider: "ga4",
      publicMeasurementId: measurementId,
    })).toThrow(AnalyticsConfigError);
  });

  it.each([
    undefined,
    null,
    {},
    { provider: "other", publicMeasurementId: "G-PSW1MY7HB4" },
    { provider: "ga4", publicMeasurementId: null },
    { provider: "disabled", publicMeasurementId: "G-PSW1MY7HB4" },
    { provider: "ga4", publicMeasurementId: "G-PSW1MY7HB4", extra: true },
  ])("fails closed for requested malformed identity %#", (identity) => {
    expect(() => resolveAnalyticsProviderConfig(
      true,
      identity as AnalyticsReleaseIdentity | null | undefined,
    )).toThrow(AnalyticsConfigError);
  });
});
