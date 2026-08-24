import {
  type ManualAdUnits,
  ManualAdUnitConfigError,
  parseManualAdUnits,
} from "./manual-units.js";

export const ADVERTISING_PROVIDERS = Object.freeze(["disabled", "adsense"] as const);

export type AdvertisingProvider = (typeof ADVERTISING_PROVIDERS)[number];
export type AdSensePublicClientId = `ca-pub-${string}`;

export interface AdvertisingReleaseIdentity {
  readonly provider: AdvertisingProvider;
  readonly enabled: boolean;
  readonly publicClientId: string | null;
}

export type AdvertisingProviderConfig =
  | {
      readonly provider: "disabled";
      readonly enabled: false;
      readonly publicClientId: null;
      readonly manualUnits: Readonly<Record<string, never>>;
    }
  | {
      readonly provider: "adsense";
      readonly enabled: true;
      readonly publicClientId: AdSensePublicClientId;
      readonly manualUnits: ManualAdUnits;
    };

export class AdvertisingConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdvertisingConfigError";
  }
}

const disabledConfig: AdvertisingProviderConfig = Object.freeze({
  provider: "disabled",
  enabled: false,
  publicClientId: null,
  manualUnits: Object.freeze({}),
});
const clientIdPattern = /^ca-pub-[0-9]{16}$/;

const fail = (message: string): never => {
  throw new AdvertisingConfigError(message);
};

function readReleaseIdentity(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return fail("release site.ads identity is required");
  }
  if (Object.keys(value).sort().join(",") !== "enabled,provider,publicClientId") {
    return fail("release site.ads must have an exact public identity shape");
  }
  return value as Record<string, unknown>;
}

export function isAdSensePublicClientId(value: unknown): value is AdSensePublicClientId {
  return typeof value === "string" && clientIdPattern.test(value);
}

export function resolveAdvertisingProviderConfig(
  productionAdvertisingEnabled: boolean,
  releaseIdentity: AdvertisingReleaseIdentity | null | undefined,
  serializedManualUnits: string | null | undefined,
): AdvertisingProviderConfig {
  if (productionAdvertisingEnabled !== true) return disabledConfig;

  const identity = readReleaseIdentity(releaseIdentity);
  if (identity.provider !== "adsense" || identity.enabled !== true) {
    return fail("requested advertising requires an enabled adsense release identity");
  }
  if (!isAdSensePublicClientId(identity.publicClientId)) {
    return fail("adsense requires a valid public client ID");
  }
  let manualUnits: ManualAdUnits;
  try {
    manualUnits = parseManualAdUnits(serializedManualUnits);
  } catch (error) {
    if (error instanceof ManualAdUnitConfigError) return fail(error.message);
    throw error;
  }
  return {
    provider: "adsense",
    enabled: true,
    publicClientId: identity.publicClientId,
    manualUnits,
  };
}
