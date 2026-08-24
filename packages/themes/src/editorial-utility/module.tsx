import type { HtmlRouteViewModel } from "../html-route-view-model.js";
import { HTML_ROUTE_KINDS } from "../html-route-view-model.js";
import { AD_SLOT_IDS, type ThemeModule } from "../theme-module.js";
import { EditorialContent } from "./content.js";
import { EditorialShell } from "./shell.js";
import { EditorialState } from "./state.js";

function RouteContent({ route }: { readonly route: HtmlRouteViewModel }) {
  switch (route.kind) {
    case "home":
    case "category":
    case "article":
    case "static-page":
    case "archive":
      return <EditorialContent route={route} />;
    case "search":
    case "not-found":
    case "retired":
      return <EditorialState route={route} />;
  }
}

export const editorialUtilityTheme = Object.freeze({
  id: "editorial-utility",
  supportedSlots: AD_SLOT_IDS,
  qualityExpectations: Object.freeze({
    routeKinds: HTML_ROUTE_KINDS,
    density: "balanced",
    articleMeasure: "narrow",
  }),
  renderRoute(model, context) {
    return (
      <EditorialShell
        shell={model.shell}
        path={model.route.path}
        breadcrumbs={model.route.breadcrumbs}
        skinId={context.skinId}
        colors={context.colors}
      >
        <RouteContent route={model.route} />
      </EditorialShell>
    );
  },
} satisfies ThemeModule);
