"use client";

import { useCallback, useRef } from "react";

import {
  AdvertisingConfigError,
  isAdSensePublicClientId,
  isAdSenseUnitId,
  type AdSensePublicClientId,
  type AdSenseUnitId,
  type AdSlotId,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";
import { canLoadGoogleAdvertising } from "@content-foundry/site-core";

import { useGoogleCmpConsent } from "../lib/use-google-cmp-consent";

interface AdSenseWindow {
  adsbygoogle?: unknown[];
}

const SLOT_MIN_HEIGHT: Readonly<Record<AdSlotId, number>> = Object.freeze({
  "home-feed": 280,
  "article-after-summary": 250,
  "article-mid-1": 250,
  "article-mid-2": 250,
  "article-end": 280,
  "desktop-sidebar": 600,
});

export function activateManualAdUnit(target: AdSenseWindow): void {
  target.adsbygoogle ??= [];
  target.adsbygoogle.push({});
}

function EnabledManualAdSlot({
  publicClientId,
  slotId,
  unitId,
}: {
  readonly publicClientId: AdSensePublicClientId;
  readonly slotId: AdSlotId;
  readonly unitId: AdSenseUnitId;
}) {
  const activated = useRef(false);
  const handleConsent = useCallback((values: unknown) => {
    if (!activated.current && canLoadGoogleAdvertising(values)) {
      activated.current = true;
      activateManualAdUnit(window as unknown as AdSenseWindow);
    }
  }, []);
  useGoogleCmpConsent(handleConsent);

  return (
    <aside
      aria-label="광고"
      data-ad-placement={slotId}
      style={{ minHeight: SLOT_MIN_HEIGHT[slotId] }}
    >
      <small aria-hidden="true">광고</small>
      <ins
        className="adsbygoogle"
        data-ad-client={publicClientId}
        data-ad-format="auto"
        data-ad-slot={unitId}
        data-full-width-responsive="true"
        style={{ display: "block" }}
      />
    </aside>
  );
}

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
    <EnabledManualAdSlot
      publicClientId={config.publicClientId}
      slotId={slotId}
      unitId={unitId}
    />
  );
}
