import type { ReactNode } from "react";

import type {
  HtmlRouteKind,
  ThemePageViewModel,
  ThemeRenderContext,
} from "./html-route-view-model.js";
import { AD_SLOT_IDS, type AdSlotId } from "./theme-ad-slot.js";
import type { ThemeId } from "./theme-id.js";

export { AD_SLOT_IDS, type AdSlotId };

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
