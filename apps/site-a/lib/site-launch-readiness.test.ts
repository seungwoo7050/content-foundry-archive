import { resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import type { BuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, it } from "vitest";

import type { VersionedSiteReleaseContext } from "./load-site-release";
import { validateSiteLaunchReadiness } from "./site-launch-readiness";

const bundle = loadReleaseBundle(resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
));
const providers = {
  consent: { provider: "disabled", configRevision: null },
  analytics: { provider: "disabled", publicMeasurementId: null },
  advertising: {
    provider: "disabled", enabled: false, publicClientId: null, manualUnits: {},
  },
  cmp: { provider: "disabled", publicClientId: null },
  adsTxtRecord: null,
} as const;
const attestations = {
  ownedGa4MeasurementId: null,
  ownedAdSenseClientId: null,
  googleCmpReady: null,
  adsenseAutoAdsEnabled: null,
  adsenseSiteReady: null,
} as const;

function context(mode: BuildTargetConfig["mode"]): VersionedSiteReleaseContext {
  return {
    contractVersion: "2.0.0",
    config: {
      siteId: "site-a",
      mode,
      releaseDirectory: "/excluded/test/path",
      origin: mode === "production" ? "https://example.com" : null,
      noindex: mode !== "production",
      analyticsEnabled: false,
      adsEnabled: false,
    },
    bundle,
    canonicalOrigin: bundle.site.origin,
  };
}

describe("Site A aggregate launch readiness", () => {
  it.each(["template", "preview"] as const)(
    "does not apply production readiness in %s",
    (mode) => expect(() => validateSiteLaunchReadiness(
      context(mode), providers, attestations,
    )).not.toThrow(),
  );

  it("aggregates origin and public-page failures in policy order", () => {
    expect(() => validateSiteLaunchReadiness(
      context("production"), providers, attestations,
    )).toThrow(expect.objectContaining({
      issues: expect.arrayContaining([
        "production origin must not use reserved hostname example.com",
        "/contact page is required",
        "/privacy page is required",
        "/advertising-disclosure page is required",
      ]),
    }));
  });
});
