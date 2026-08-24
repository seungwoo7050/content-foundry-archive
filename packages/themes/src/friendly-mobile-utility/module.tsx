import type { ReactNode } from "react";

import {
  HTML_ROUTE_KINDS,
  type ThemePageViewModel,
  type ThemeRenderContext,
} from "../html-route-view-model.js";
import type { ThemeModule } from "../theme-module.js";
import { renderFriendlyContentRoute } from "./content.js";
import { FriendlyMobileShell } from "./shell.js";
import { renderFriendlyStateRoute } from "./state.js";

function renderRouteContent(
  model: ThemePageViewModel,
  context: ThemeRenderContext,
): ReactNode {
  switch (model.route.kind) {
    case "home":
    case "category":
    case "article":
    case "static-page":
    case "archive":
      return renderFriendlyContentRoute(model.route, context);
    case "search":
    case "not-found":
    case "retired":
      return renderFriendlyStateRoute(model.route);
    default: {
      const unhandled: never = model.route;
      return unhandled;
    }
  }
}

function renderRoute(
  model: ThemePageViewModel,
  context: ThemeRenderContext,
): ReactNode {
  return (
    <FriendlyMobileShell
      context={context}
      routeKind={model.route.kind}
      shell={model.shell}
    >
      {renderRouteContent(model, context)}
    </FriendlyMobileShell>
  );
}

export const friendlyMobileUtilityTheme: ThemeModule = Object.freeze({
  id: "friendly-mobile-utility",
  supportedSlots: Object.freeze([
    "home-feed",
    "article-after-summary",
    "article-end",
  ] as const),
  qualityExpectations: Object.freeze({
    routeKinds: HTML_ROUTE_KINDS,
    density: "spacious",
    articleMeasure: "narrow",
  }),
  renderRoute,
});
