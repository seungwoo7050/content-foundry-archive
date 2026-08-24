import type { HtmlRouteViewModel } from "../html-route-view-model.js";
import { HTML_ROUTE_KINDS } from "../html-route-view-model.js";
import type { ThemeModule } from "../theme-module.js";
import { CleanPersonalContent } from "./content.js";
import { CleanPersonalBlogShell } from "./shell.js";
import { CleanPersonalState } from "./state.js";

function RouteContent({ route }: { readonly route: HtmlRouteViewModel }) {
  switch (route.kind) {
    case "home":
    case "category":
    case "article":
    case "static-page":
    case "archive":
      return <CleanPersonalContent route={route} />;
    case "search":
    case "not-found":
    case "retired":
      return <CleanPersonalState route={route} />;
  }
}

export const cleanPersonalBlogTheme = Object.freeze({
  id: "clean-personal-blog",
  supportedSlots: Object.freeze([]),
  qualityExpectations: Object.freeze({
    routeKinds: HTML_ROUTE_KINDS,
    density: "spacious",
    articleMeasure: "narrow",
  }),
  renderRoute(model, context) {
    return (
      <CleanPersonalBlogShell context={context} model={model}>
        <RouteContent route={model.route} />
      </CleanPersonalBlogShell>
    );
  },
} satisfies ThemeModule);
