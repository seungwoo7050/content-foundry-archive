import type { ReactNode } from "react";

import type { LinkViewModel } from "./presentation-view-model.js";
import type { RouteBaseViewModel } from "./route-base-view-model.js";

export const STATE_RECOVERY_LINK_KINDS = Object.freeze([
  "search",
  "category",
  "replacement",
] as const);

export type StateRecoveryLinkKind =
  (typeof STATE_RECOVERY_LINK_KINDS)[number];

export interface StateRecoveryLinkViewModel extends LinkViewModel {
  readonly kind: StateRecoveryLinkKind;
}

export interface SearchRouteViewModel extends RouteBaseViewModel<"search"> {
  readonly client: ReactNode;
}

export interface NotFoundRouteViewModel
  extends RouteBaseViewModel<"not-found"> {
  readonly statusCode: 404;
  readonly action: LinkViewModel;
  readonly recoveryLinks?: readonly StateRecoveryLinkViewModel[];
}

export interface RetiredRouteViewModel extends RouteBaseViewModel<"retired"> {
  readonly statusCode: 410;
  readonly action: LinkViewModel;
  readonly recoveryLinks?: readonly StateRecoveryLinkViewModel[];
}

export type StateRouteViewModel =
  | SearchRouteViewModel
  | NotFoundRouteViewModel
  | RetiredRouteViewModel;
