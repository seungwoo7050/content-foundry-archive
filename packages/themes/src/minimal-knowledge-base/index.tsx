import type { HtmlRouteViewModel } from "../html-route-view-model.js";
import { HTML_ROUTE_KINDS } from "../html-route-view-model.js";
import type { ThemeModule } from "../theme-module.js";
import { MinimalKnowledgeBaseContentRoute } from "./content-routes.js";
import { MinimalKnowledgeBaseShell } from "./shell.js";
import { MinimalKnowledgeBaseStateRoute } from "./state-routes.js";

function RouteContent({ route }: { readonly route: HtmlRouteViewModel }) {
  switch (route.kind) {
    case "home":
    case "category":
    case "article":
    case "static-page":
    case "archive":
      return <MinimalKnowledgeBaseContentRoute route={route} />;
    case "search":
    case "not-found":
    case "retired":
      return <MinimalKnowledgeBaseStateRoute route={route} />;
  }
}

export const minimalKnowledgeBaseTheme = Object.freeze({
  id: "minimal-knowledge-base",
  supportedSlots: Object.freeze([]),
  qualityExpectations: Object.freeze({
    routeKinds: HTML_ROUTE_KINDS,
    density: "dense",
    articleMeasure: "narrow",
  }),
  renderRoute(model, context) {
    return (
      <MinimalKnowledgeBaseShell context={context} shell={model.shell}>
        <RouteContent route={model.route} />
      </MinimalKnowledgeBaseShell>
    );
  },
} satisfies ThemeModule);
