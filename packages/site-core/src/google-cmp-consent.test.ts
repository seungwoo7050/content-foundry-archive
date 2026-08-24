import { describe, expect, it } from "vitest";

import {
  GOOGLE_CMP_PURPOSE_STATUS,
  canLoadGoogleAdvertising,
  canLoadGoogleAnalytics,
} from "./google-cmp-consent.js";

const granted = {
  adStoragePurposeConsentStatus: GOOGLE_CMP_PURPOSE_STATUS.GRANTED,
  adUserDataPurposeConsentStatus: GOOGLE_CMP_PURPOSE_STATUS.GRANTED,
  adPersonalizationPurposeConsentStatus: GOOGLE_CMP_PURPOSE_STATUS.GRANTED,
  analyticsStoragePurposeConsentStatus: GOOGLE_CMP_PURPOSE_STATUS.GRANTED,
};

describe("Google CMP basic consent-mode gates", () => {
  it("permits only explicit purpose grants", () => {
    expect(canLoadGoogleAnalytics(granted)).toBe(true);
    expect(canLoadGoogleAdvertising(granted)).toBe(true);
  });

  it.each([
    GOOGLE_CMP_PURPOSE_STATUS.UNKNOWN,
    GOOGLE_CMP_PURPOSE_STATUS.DENIED,
    GOOGLE_CMP_PURPOSE_STATUS.NOT_APPLICABLE,
    GOOGLE_CMP_PURPOSE_STATUS.NOT_CONFIGURED,
    -1,
    "1",
  ])("denies non-permitted analytics status %j", (status) => {
    expect(canLoadGoogleAnalytics({
      ...granted,
      analyticsStoragePurposeConsentStatus: status,
    })).toBe(false);
  });

  it.each([
    "adStoragePurposeConsentStatus",
    "adUserDataPurposeConsentStatus",
    "adPersonalizationPurposeConsentStatus",
  ] as const)("denies non-permitted advertising status at %s", (purpose) => {
    expect(canLoadGoogleAdvertising({
      ...granted,
      [purpose]: GOOGLE_CMP_PURPOSE_STATUS.DENIED,
    })).toBe(false);
  });

  it.each([null, [], {}, { ...granted, extra: true }])(
    "denies malformed consent values %#",
    (value) => {
      expect(canLoadGoogleAnalytics(value)).toBe(false);
      expect(canLoadGoogleAdvertising(value)).toBe(false);
    },
  );
});
