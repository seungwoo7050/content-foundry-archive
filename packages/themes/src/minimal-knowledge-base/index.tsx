import type {
  HtmlRouteViewModel,
  ThemeRenderContext,
} from "../html-route-view-model.js";
import { HTML_ROUTE_KINDS } from "../html-route-view-model.js";
import type { ThemeModule } from "../theme-module.js";
import { MinimalKnowledgeBaseContentRoute } from "./content-routes.js";
import { MinimalKnowledgeBaseShell } from "./shell.js";
import { MinimalKnowledgeBaseStateRoute } from "./state-routes.js";

function RouteContent({
  context,
  route,
}: {
  readonly context: ThemeRenderContext;
  readonly route: HtmlRouteViewModel;
}) {
  switch (route.kind) {
    case "home":
    case "category":
    case "article":
    case "static-page":
    case "archive":
      return <MinimalKnowledgeBaseContentRoute context={context} route={route} />;
    case "search":
    case "not-found":
    case "retired":
      return <MinimalKnowledgeBaseStateRoute route={route} />;
  }
}

export const minimalKnowledgeBaseTheme = Object.freeze({
  id: "minimal-knowledge-base",
  supportedSlots: Object.freeze([
    "article-after-summary",
    "article-end",
  ] as const),
  qualityExpectations: Object.freeze({
    routeKinds: HTML_ROUTE_KINDS,
    density: "dense",
    articleMeasure: "narrow",
  }),
  renderRoute(model, context) {
    return (
      <MinimalKnowledgeBaseShell
        context={context}
        routePath={model.route.path}
        shell={model.shell}
      >
        <RouteContent context={context} route={model.route} />
      </MinimalKnowledgeBaseShell>
    );
  },
} satisfies ThemeModule);
