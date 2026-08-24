import type { ReactNode } from "react";

export const AD_SLOT_IDS = Object.freeze([
  "home-feed",
  "article-after-summary",
  "article-mid-1",
  "article-mid-2",
  "article-end",
  "desktop-sidebar",
] as const);

export type AdSlotId = (typeof AD_SLOT_IDS)[number];
export type ThemeAdSlots = Readonly<Partial<Record<AdSlotId, ReactNode>>>;

export interface ThemeAdSlotContext {
  readonly adSlots?: ThemeAdSlots;
}

export function getThemeAdSlot(
  context: ThemeAdSlotContext,
  slotId: AdSlotId,
): ReactNode {
  return context.adSlots?.[slotId] ?? null;
}
