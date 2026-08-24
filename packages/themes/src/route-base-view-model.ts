import type { LinkViewModel } from "./presentation-view-model.js";

export interface RouteBaseViewModel<TKind extends string> {
  readonly kind: TKind;
  readonly path: string;
  readonly heading: string;
  readonly description: string;
  readonly breadcrumbs: readonly LinkViewModel[];
}
