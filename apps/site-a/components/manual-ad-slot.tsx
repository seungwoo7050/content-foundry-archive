import {
  AdvertisingConfigError,
  isAdSensePublicClientId,
  isAdSenseUnitId,
  type AdSlotId,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";

const ADSENSE_PUSH_SOURCE =
  "(adsbygoogle = window.adsbygoogle || []).push({});";

export function ManualAdSlot({
  config,
  slotId,
}: {
  readonly config: AdvertisingProviderConfig;
  readonly slotId: AdSlotId;
}) {
  if (config.provider === "disabled") return null;
  if (!isAdSensePublicClientId(config.publicClientId)) {
    throw new AdvertisingConfigError(
      "manual AdSense slot requires a valid public client ID",
    );
  }
  const unitId = config.manualUnits[slotId];
  if (unitId === undefined) return null;
  if (!isAdSenseUnitId(unitId)) {
    throw new AdvertisingConfigError(
      `manual AdSense slot ${slotId} requires a valid unit ID`,
    );
  }

  return (
    <aside aria-label="광고" data-ad-placement={slotId}>
      <ins
        className="adsbygoogle"
        data-ad-client={config.publicClientId}
        data-ad-format="auto"
        data-ad-slot={unitId}
        data-full-width-responsive="true"
        style={{ display: "block" }}
      />
      <script>{ADSENSE_PUSH_SOURCE}</script>
    </aside>
  );
}
