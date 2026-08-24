import { describe, expect, it } from "vitest";

import { createSiteAdsTxtResponse } from "./site-ads-txt-response";
import { resolveSiteGoogleCmpConfig } from "./site-google-cmp-config";

const googleConsent = {
  provider: "google-cmp",
  configRevision: "cmp-revision-1",
} as const;
const releaseAds = {
  provider: "adsense",
  enabled: false,
  publicClientId: "ca-pub-1234567890123456",
} as const;

describe("Site A ads.txt response", () => {
  it("publishes one exact production Google record", async () => {
    const publication = resolveSiteGoogleCmpConfig(
      true,
      googleConsent,
      releaseAds,
    );
    const response = createSiteAdsTxtResponse(publication);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(await response.text()).toBe(
      "google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0",
    );
  });

  it.each([
    [false, googleConsent],
    [true, { provider: "disabled", configRevision: null } as const],
  ])("keeps non-publishing configuration empty", async (production, consent) => {
    const publication = resolveSiteGoogleCmpConfig(
      production,
      consent,
      releaseAds,
    );
    const response = createSiteAdsTxtResponse(publication);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });
});
