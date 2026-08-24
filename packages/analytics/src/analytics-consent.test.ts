import { describe, expect, it } from "vitest";

import {
  canLoadAnalytics,
  resolveAnalyticsProviderConfig,
} from "./ga4.js";

const revision = "sha256:consent-a";
const config = resolveAnalyticsProviderConfig(true, {
  provider: "ga4",
  publicMeasurementId: "G-PSW1MY7HB4",
});

describe("analytics load permission", () => {
  it("permits only a current explicit analytics grant", () => {
    expect(canLoadAnalytics(config, {
      status: "selected",
      configRevision: revision,
      analytics: "granted",
    }, revision)).toBe(true);
  });

  it.each([
    { status: "unset", configRevision: revision, analytics: "denied" },
    { status: "selected", configRevision: revision, analytics: "denied" },
    { status: "selected", configRevision: "sha256:old", analytics: "granted" },
  ] as const)("denies unset, denied, or revision-invalidated state %#", (consent) => {
    expect(canLoadAnalytics(config, consent, revision)).toBe(false);
  });

  it("denies disabled, forged, or revisionless provider state", () => {
    const granted = {
      status: "selected",
      configRevision: revision,
      analytics: "granted",
    } as const;

    expect(canLoadAnalytics(
      { provider: "disabled", publicMeasurementId: null },
      granted,
      revision,
    )).toBe(false);
    expect(canLoadAnalytics(
      { provider: "ga4", publicMeasurementId: "G-invalid" },
      granted,
      revision,
    )).toBe(false);
    expect(canLoadAnalytics(config, granted, null)).toBe(false);
  });
});
