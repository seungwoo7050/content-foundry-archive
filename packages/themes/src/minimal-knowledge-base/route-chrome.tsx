import type { RouteBaseViewModel } from "../route-base-view-model.js";
import { ThemeBreadcrumbs } from "../theme-links.js";

type BreadcrumbRoute = Pick<
  RouteBaseViewModel<string>,
  "breadcrumbs" | "path"
>;

export function KnowledgeBreadcrumbs({ route }: { readonly route: BreadcrumbRoute }) {
  return route.breadcrumbs.length > 0 ? (
    <ThemeBreadcrumbs
      ariaLabel="현재 위치"
      currentPath={route.path}
      items={route.breadcrumbs}
    />
  ) : null;
}
