import { AdvertisingConfigError, isAdSensePublicClientId } from "./provider.js";

const ADSENSE_DOMAIN = "google.com";
const ADSENSE_RELATIONSHIP = "DIRECT";
const GOOGLE_CERTIFICATION_AUTHORITY_ID = "f08c47fec0942fa0";

export function createAdsTxtRecord(publicClientId: string): string {
  if (!isAdSensePublicClientId(publicClientId)) {
    throw new AdvertisingConfigError("ads.txt requires a valid public client ID");
  }
  const publisherId = publicClientId.slice("ca-".length);
  return [
    ADSENSE_DOMAIN,
    publisherId,
    ADSENSE_RELATIONSHIP,
    GOOGLE_CERTIFICATION_AUTHORITY_ID,
  ].join(", ");
}
