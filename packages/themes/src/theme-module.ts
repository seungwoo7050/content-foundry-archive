import type { ReactNode } from "react";

import type {
  HtmlRouteKind,
  ThemePageViewModel,
  ThemeRenderContext,
} from "./html-route-view-model.js";
import type { ThemeId } from "./theme-id.js";

export const AD_SLOT_IDS = Object.freeze([
  "home-feed",
  "article-after-summary",
  "article-mid-1",
  "article-mid-2",
  "article-end",
  "desktop-sidebar",
] as const);

export type AdSlotId = (typeof AD_SLOT_IDS)[number];

export interface ThemeQualityProfile {
  readonly routeKinds: readonly HtmlRouteKind[];
  readonly density: "spacious" | "balanced" | "dense";
  readonly articleMeasure: "narrow" | "standard";
}

export interface ThemeModule {
  readonly id: ThemeId;
  readonly supportedSlots: readonly AdSlotId[];
  readonly qualityExpectations: ThemeQualityProfile;
  renderRoute(
    model: ThemePageViewModel,
    context: ThemeRenderContext,
  ): ReactNode;
}
