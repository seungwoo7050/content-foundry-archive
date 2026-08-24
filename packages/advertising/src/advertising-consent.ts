import { hasValidManualAdUnits } from "./manual-units.js";
import { type AdvertisingProviderConfig, isAdSensePublicClientId } from "./provider.js";

export interface AdvertisingConsentState {
  readonly status: "unset" | "selected";
  readonly configRevision: string;
  readonly advertising: "granted" | "denied";
}

export function canLoadAdvertising(
  config: AdvertisingProviderConfig,
  consent: AdvertisingConsentState,
  currentConfigRevision: string | null,
): boolean {
  return (
    config.provider === "adsense" &&
    config.enabled === true &&
    isAdSensePublicClientId(config.publicClientId) &&
    hasValidManualAdUnits(config.manualUnits) &&
    consent.status === "selected" &&
    consent.advertising === "granted" &&
    typeof currentConfigRevision === "string" &&
    currentConfigRevision.length > 0 &&
    consent.configRevision === currentConfigRevision
  );
}
