export interface GoneRouteRecord {
  readonly type: "gone";
  readonly path: string;
  readonly status: 410;
  readonly replacementPath: string | null;
}

interface RedirectRouteRecord {
  readonly type: "redirect";
}

export interface GoneRouteSource<
  TGone extends GoneRouteRecord = GoneRouteRecord,
> {
  readonly redirects: {
    readonly items: readonly (TGone | RedirectRouteRecord)[];
  };
}

export type GoneRouteOwner = "article" | "category" | "root";

export function getGoneRouteOwner(path: string): GoneRouteOwner {
  if (/^\/article\/[^/]+$/.test(path)) return "article";
  if (/^\/category\/[^/]+$/.test(path)) return "category";
  return "root";
}

export function getGoneRoutes<TGone extends GoneRouteRecord>(
  bundle: GoneRouteSource<TGone>,
): TGone[] {
  return bundle.redirects.items.filter(
    (item): item is TGone => item.type === "gone",
  );
}

export function findGoneRoute<TGone extends GoneRouteRecord>(
  bundle: GoneRouteSource<TGone>,
  path: string,
): TGone | undefined {
  return getGoneRoutes(bundle).find((item) => item.path === path);
}

export function getGoneArticleStaticParams(bundle: GoneRouteSource) {
  return getGoneRoutes(bundle)
    .filter((item) => getGoneRouteOwner(item.path) === "article")
    .map((item) => ({ slug: item.path.slice("/article/".length) }));
}

export function getGoneCategoryStaticParams(bundle: GoneRouteSource) {
  return getGoneRoutes(bundle)
    .filter((item) => getGoneRouteOwner(item.path) === "category")
    .map((item) => ({ category: item.path.slice("/category/".length) }));
}

export function getGoneRootStaticParams(bundle: GoneRouteSource) {
  return getGoneRoutes(bundle)
    .filter((item) => getGoneRouteOwner(item.path) === "root")
    .map((item) => ({ pagePath: item.path.slice(1).split("/") }));
}
