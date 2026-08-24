import type { ReactNode } from "react";

import {
  AD_SLOT_IDS as ADVERTISING_SLOT_IDS,
  AdvertisingConfigError,
  hasValidManualAdUnits,
  isAdSensePublicClientId,
  type AdSlotId,
  type AdvertisingProviderConfig,
} from "@content-foundry/advertising";
import {
  AD_SLOT_IDS as THEME_SLOT_IDS,
  type ThemeAdSlots,
} from "@content-foundry/themes";

import { ManualAdSlot } from "../components/manual-ad-slot";

const EMPTY_SITE_AD_SLOTS: ThemeAdSlots = Object.freeze({});

export function assertMatchingAdSlotVocabularies(
  advertisingSlotIds: readonly string[],
  themeSlotIds: readonly string[],
): void {
  if (
    advertisingSlotIds.length !== themeSlotIds.length ||
    advertisingSlotIds.some((slotId, index) => slotId !== themeSlotIds[index])
  ) {
    throw new AdvertisingConfigError(
      "advertising and theme slot vocabularies must match exactly",
    );
  }
}

export function createSiteAdSlots(
  config: AdvertisingProviderConfig,
): ThemeAdSlots {
  assertMatchingAdSlotVocabularies(
    ADVERTISING_SLOT_IDS,
    THEME_SLOT_IDS,
  );
  if (config.provider === "disabled") return EMPTY_SITE_AD_SLOTS;
  if (
    config.enabled !== true ||
    !isAdSensePublicClientId(config.publicClientId) ||
    !hasValidManualAdUnits(config.manualUnits)
  ) {
    throw new AdvertisingConfigError(
      "enabled Site A advertising requires a valid manual configuration",
    );
  }

  const slots: Partial<Record<AdSlotId, ReactNode>> = {};
  for (const slotId of ADVERTISING_SLOT_IDS) {
    if (config.manualUnits[slotId] !== undefined) {
      slots[slotId] = <ManualAdSlot config={config} slotId={slotId} />;
    }
  }
  return Object.freeze(slots);
}
