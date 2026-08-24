import { describe, expect, expectTypeOf, it } from "vitest";

import {
  ADVERTISING_PROVIDERS,
  AdvertisingConfigError,
  type AdvertisingProvider,
  type AdvertisingProviderConfig,
  type AdvertisingReleaseIdentity,
  isAdSensePublicClientId,
  resolveAdvertisingProviderConfig,
} from "./provider.js";

const identity = {
  provider: "adsense",
  enabled: true,
  publicClientId: "ca-pub-1234567890123456",
} satisfies AdvertisingReleaseIdentity;
const units = '{"article-end":"9876543210"}';

describe("AdSense provider configuration", () => {
  it("exposes exact states and resolves matching production facts", () => {
    const config = resolveAdvertisingProviderConfig(true, identity, units);

    expect(ADVERTISING_PROVIDERS).toEqual(["disabled", "adsense"]);
    expect(config).toEqual({ ...identity, manualUnits: { "article-end": "9876543210" } });
    expectTypeOf<AdvertisingProvider>().toEqualTypeOf<"disabled" | "adsense">();
    expectTypeOf(config).toEqualTypeOf<AdvertisingProviderConfig>();
  });

  it("returns an identity-free disabled config when the build flag is false", () => {
    expect(resolveAdvertisingProviderConfig(false, undefined, undefined)).toEqual({
      provider: "disabled",
      enabled: false,
      publicClientId: null,
      manualUnits: {},
    });
    expect(resolveAdvertisingProviderConfig(false, {
      provider: "adsense",
      enabled: true,
      publicClientId: "malformed",
    }, "not-json")).toEqual({
      provider: "disabled",
      enabled: false,
      publicClientId: null,
      manualUnits: {},
    });
  });

  it.each([
    "ca-pub-1234567890123456",
    "ca-pub-0000000000000000",
  ])("accepts strict public client ID %s", (clientId) => {
    expect(isAdSensePublicClientId(clientId)).toBe(true);
  });

  it.each([
    "pub-1234567890123456",
    "ca-pub-123456789012345",
    "ca-pub-12345678901234567",
    "ca-pub-123456789012345x",
    "ca-pub-１２３４５６７８９０１２３４５６",
    " ca-pub-1234567890123456",
    "ca-pub-1234567890123456 ",
  ])("rejects malformed public client ID %j", (clientId) => {
    expect(isAdSensePublicClientId(clientId)).toBe(false);
  });

  it.each([
    undefined,
    null,
    {},
    { provider: "disabled", enabled: false, publicClientId: null },
    { provider: "adsense", enabled: false, publicClientId: "ca-pub-1234567890123456" },
    { provider: "other", enabled: true, publicClientId: "ca-pub-1234567890123456" },
    { provider: "adsense", enabled: true, publicClientId: null },
    { ...identity, extra: true },
  ])("fails closed for requested mismatched identity %#", (releaseIdentity) => {
    expect(() => resolveAdvertisingProviderConfig(
      true,
      releaseIdentity as AdvertisingReleaseIdentity | null | undefined,
      units,
    )).toThrow(AdvertisingConfigError);
  });

  it("surfaces malformed enabled manual units as a provider config error", () => {
    expect(() => resolveAdvertisingProviderConfig(true, identity, "{}"))
      .toThrow(AdvertisingConfigError);
  });
});
