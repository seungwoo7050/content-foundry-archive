export const GOOGLE_CMP_PURPOSE_STATUS = Object.freeze({
  UNKNOWN: 0,
  GRANTED: 1,
  DENIED: 2,
  NOT_APPLICABLE: 3,
  NOT_CONFIGURED: 4,
} as const);

export interface GoogleCmpConsentModeValues {
  readonly adStoragePurposeConsentStatus: number;
  readonly adUserDataPurposeConsentStatus: number;
  readonly adPersonalizationPurposeConsentStatus: number;
  readonly analyticsStoragePurposeConsentStatus: number;
}

function permitsPurpose(value: unknown): boolean {
  return value === GOOGLE_CMP_PURPOSE_STATUS.GRANTED;
}

function readValues(value: unknown): GoogleCmpConsentModeValues | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const values = value as Record<string, unknown>;
  if (
    Object.keys(values).sort().join(",")
    !== "adPersonalizationPurposeConsentStatus,adStoragePurposeConsentStatus,adUserDataPurposeConsentStatus,analyticsStoragePurposeConsentStatus"
  ) {
    return null;
  }
  return values as unknown as GoogleCmpConsentModeValues;
}

export function canLoadGoogleAnalytics(value: unknown): boolean {
  const consent = readValues(value);
  return consent !== null
    && permitsPurpose(consent.analyticsStoragePurposeConsentStatus);
}

export function canLoadGoogleAdvertising(value: unknown): boolean {
  const consent = readValues(value);
  return consent !== null
    && permitsPurpose(consent.adStoragePurposeConsentStatus)
    && permitsPurpose(consent.adUserDataPurposeConsentStatus)
    && permitsPurpose(consent.adPersonalizationPurposeConsentStatus);
}
