import type { ReactNode } from "react";

import type { LinkViewModel } from "./presentation-view-model.js";
import type { RouteBaseViewModel } from "./route-base-view-model.js";

export interface SearchRouteViewModel extends RouteBaseViewModel<"search"> {
  readonly client: ReactNode;
}

export interface NotFoundRouteViewModel
  extends RouteBaseViewModel<"not-found"> {
  readonly statusCode: 404;
  readonly action: LinkViewModel;
}

export interface RetiredRouteViewModel extends RouteBaseViewModel<"retired"> {
  readonly statusCode: 410;
  readonly action: LinkViewModel;
}

export type StateRouteViewModel =
  | SearchRouteViewModel
  | NotFoundRouteViewModel
  | RetiredRouteViewModel;
