import type { ContentRouteViewModel } from "./content-route-view-model.js";
import type { SiteShellViewModel } from "./presentation-view-model.js";
import type { SemanticColorTokens, SkinId } from "./skin.js";
import type { StateRouteViewModel } from "./state-route-view-model.js";

export const HTML_ROUTE_KINDS = Object.freeze([
  "home",
  "category",
  "article",
  "static-page",
  "archive",
  "search",
  "not-found",
  "retired",
] as const);

export type HtmlRouteViewModel = ContentRouteViewModel | StateRouteViewModel;
export type HtmlRouteKind = HtmlRouteViewModel["kind"];

export interface ThemePageViewModel {
  readonly shell: SiteShellViewModel;
  readonly route: HtmlRouteViewModel;
}

export interface ThemeRenderContext {
  readonly skinId: SkinId;
  readonly colors: SemanticColorTokens;
}
