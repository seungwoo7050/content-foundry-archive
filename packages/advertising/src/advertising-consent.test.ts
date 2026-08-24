import { describe, expect, it } from "vitest";

import { canLoadAdvertising } from "./advertising-consent.js";
import { resolveAdvertisingProviderConfig } from "./provider.js";

const revision = "sha256:consent-a";
const config = resolveAdvertisingProviderConfig(true, {
  provider: "adsense",
  enabled: true,
  publicClientId: "ca-pub-1234567890123456",
}, '{"article-end":"9876543210"}');

describe("advertising load permission", () => {
  it("permits only a current explicit advertising grant", () => {
    expect(canLoadAdvertising(config, {
      status: "selected",
      configRevision: revision,
      advertising: "granted",
    }, revision)).toBe(true);
  });

  it.each([
    { status: "unset", configRevision: revision, advertising: "denied" },
    { status: "selected", configRevision: revision, advertising: "denied" },
    { status: "selected", configRevision: "sha256:old", advertising: "granted" },
  ] as const)("denies unset, denied, or revision-invalidated state %#", (consent) => {
    expect(canLoadAdvertising(config, consent, revision)).toBe(false);
  });

  it("denies disabled configuration and missing current revision", () => {
    const granted = {
      status: "selected",
      configRevision: revision,
      advertising: "granted",
    } as const;

    expect(canLoadAdvertising({
      provider: "disabled",
      enabled: false,
      publicClientId: null,
      manualUnits: {},
    }, granted, revision)).toBe(false);
    expect(canLoadAdvertising(config, granted, null)).toBe(false);
  });
});
