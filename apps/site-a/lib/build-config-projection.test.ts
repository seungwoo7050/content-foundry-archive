import { parseManualAdUnits } from "@content-foundry/advertising";
import type { BuildTargetConfig } from "@content-foundry/site-core";
import { describe, expect, it } from "vitest";

import {
  BUILD_CONFIG_SCHEMA_VERSION,
  createBuildConfigProjection,
} from "./build-config-projection";
import type { SiteLaunchConfig } from "./site-launch-config";

const config: BuildTargetConfig = {
  siteId: "site-a",
  mode: "production",
  releaseDirectory: "/private/release/path",
  origin: "https://guides.example.kr",
  noindex: false,
  analyticsEnabled: true,
  adsEnabled: true,
};
const launch: SiteLaunchConfig = {
  consent: { provider: "google-cmp", configRevision: "cmp-r1" },
  analytics: { provider: "ga4", publicMeasurementId: "G-SITEA123" },
  advertising: {
    provider: "adsense",
    enabled: true,
    publicClientId: "ca-pub-1234567890123456",
    manualUnits: parseManualAdUnits(
      '{"article-end":"456","home-feed":"123"}',
    ),
  },
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
    adsenseSiteReady: true,
  },
  analyticsOwnershipVerified: true,
  advertisingOwnershipVerified: true,
};

describe("public build configuration projection", () => {
  it("uses fixed fields and canonical manual-unit order", () => {
    const projection = createBuildConfigProjection({ config, launch });

    expect(BUILD_CONFIG_SCHEMA_VERSION).toBe("1.0.0");
    expect(projection.advertising.manualUnits).toEqual([
      ["home-feed", "123"],
      ["article-end", "456"],
    ]);
    expect(projection).toMatchObject({
      siteId: "site-a",
      mode: "production",
      productionOrigin: "https://guides.example.kr",
      noindex: false,
      analyticsEnabled: true,
      adsEnabled: true,
      googleCmpReady: true,
      adsenseAutoAdsEnabled: false,
      adsenseSiteReady: true,
      analyticsOwnershipVerified: true,
      advertisingOwnershipVerified: true,
    });
    expect(JSON.stringify(projection)).not.toMatch(
      /private\/release|ownedGa4MeasurementId|ownedAdSenseClientId/,
    );
  });
});
