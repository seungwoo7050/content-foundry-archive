import type {
  HtmlRouteViewModel,
  ThemeRenderContext,
} from "../html-route-view-model.js";
import { HTML_ROUTE_KINDS } from "../html-route-view-model.js";
import type { ThemeModule } from "../theme-module.js";
import { CleanPersonalContent } from "./content.js";
import { CleanPersonalBlogShell } from "./shell.js";
import { CleanPersonalState } from "./state.js";

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
      return <CleanPersonalContent context={context} route={route} />;
    case "search":
    case "not-found":
    case "retired":
      return <CleanPersonalState route={route} />;
  }
}

export const cleanPersonalBlogTheme = Object.freeze({
  id: "clean-personal-blog",
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
  renderRoute(model, context) {
    return (
      <CleanPersonalBlogShell context={context} model={model}>
        <RouteContent context={context} route={model.route} />
      </CleanPersonalBlogShell>
    );
  },
} satisfies ThemeModule);
