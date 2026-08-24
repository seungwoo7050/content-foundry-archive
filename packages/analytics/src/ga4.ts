export const ANALYTICS_PROVIDERS = Object.freeze(["disabled", "ga4"] as const);

export type AnalyticsProvider = (typeof ANALYTICS_PROVIDERS)[number];
export type Ga4MeasurementId = `G-${string}`;

export interface AnalyticsReleaseIdentity {
  readonly provider: AnalyticsProvider;
  readonly publicMeasurementId: string | null;
}

export type AnalyticsProviderConfig =
  | { readonly provider: "disabled"; readonly publicMeasurementId: null }
  | { readonly provider: "ga4"; readonly publicMeasurementId: Ga4MeasurementId };

export interface AnalyticsConsentState {
  readonly status: "unset" | "selected";
  readonly configRevision: string;
  readonly analytics: "granted" | "denied";
}

export class AnalyticsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsConfigError";
  }
}

const disabledConfig: AnalyticsProviderConfig = Object.freeze({
  provider: "disabled",
  publicMeasurementId: null,
});
const MAX_MEASUREMENT_ID_SUFFIX_LENGTH = 32;
const GA4_PREFIX = "G-";
const GA4_SUFFIX = /^[A-Z0-9]+$/;

const fail = (message: string): never => {
  throw new AnalyticsConfigError(message);
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isGa4MeasurementId(value: unknown): value is Ga4MeasurementId {
  if (typeof value !== "string" || !value.startsWith(GA4_PREFIX)) return false;
  const suffix = value.slice(GA4_PREFIX.length);
  return (
    suffix.length >= 1 &&
    suffix.length <= MAX_MEASUREMENT_ID_SUFFIX_LENGTH &&
    GA4_SUFFIX.test(suffix)
  );
}

function readReleaseIdentity(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) return fail("release site.analytics identity is required");
  if (Object.keys(value).sort().join(",") !== "provider,publicMeasurementId") {
    return fail("release site.analytics must have an exact public identity shape");
  }
  return value;
}

export function resolveAnalyticsProviderConfig(
  productionAnalyticsEnabled: boolean,
  releaseIdentity: AnalyticsReleaseIdentity | null | undefined,
): AnalyticsProviderConfig {
  if (productionAnalyticsEnabled !== true) return disabledConfig;

  const identity = readReleaseIdentity(releaseIdentity);
  if (identity.provider === "disabled") {
    if (identity.publicMeasurementId !== null) {
      return fail("disabled analytics must not declare a public measurement ID");
    }
    return disabledConfig;
  }
  if (identity.provider !== "ga4") {
    return fail("release analytics provider must be disabled or ga4");
  }
  if (!isGa4MeasurementId(identity.publicMeasurementId)) {
    return fail("ga4 requires a valid public measurement ID");
  }
  return { provider: "ga4", publicMeasurementId: identity.publicMeasurementId };
}

export function canLoadAnalytics(
  config: AnalyticsProviderConfig,
  consent: AnalyticsConsentState,
  currentConfigRevision: string | null,
): boolean {
  return (
    config.provider === "ga4" &&
    isGa4MeasurementId(config.publicMeasurementId) &&
    consent.status === "selected" &&
    consent.analytics === "granted" &&
    typeof currentConfigRevision === "string" &&
    currentConfigRevision.length > 0 &&
    consent.configRevision === currentConfigRevision
  );
}
