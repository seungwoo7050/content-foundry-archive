import type { ReactNode } from "react";

import {
  HTML_ROUTE_KINDS,
  type ThemePageViewModel,
  type ThemeRenderContext,
} from "../html-route-view-model.js";
import type { ThemeModule } from "../theme-module.js";
import { renderInformationPortalContent } from "./content.js";
import { InformationPortalShell } from "./shell.js";
import { renderInformationPortalState } from "./state.js";

function renderContent(
  model: ThemePageViewModel,
  context: ThemeRenderContext,
): ReactNode {
  switch (model.route.kind) {
    case "home":
    case "category":
    case "article":
    case "static-page":
    case "archive":
      return renderInformationPortalContent(model.route, context);
    case "search":
    case "not-found":
    case "retired":
      return renderInformationPortalState(model.route);
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
    <InformationPortalShell
      context={context}
      routeKind={model.route.kind}
      routePath={model.route.path}
      shell={model.shell}
    >
      {renderContent(model, context)}
    </InformationPortalShell>
  );
}

export const informationPortalTheme: ThemeModule = Object.freeze({
  id: "information-portal",
  supportedSlots: Object.freeze([
    "home-feed",
    "article-after-summary",
    "article-end",
    "desktop-sidebar",
  ] as const),
  qualityExpectations: Object.freeze({
    routeKinds: HTML_ROUTE_KINDS,
    density: "dense",
    articleMeasure: "standard",
  }),
  renderRoute,
});
