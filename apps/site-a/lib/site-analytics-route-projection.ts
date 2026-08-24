import {
  ANALYTICS_EVENT_CONTRACT_VERSION,
  ANALYTICS_SKIN_IDS,
  type AnalyticsEventContext,
  type AnalyticsRouteType,
  type AnalyticsThemeId,
} from "@content-foundry/analytics";

import { getGoneRoutes, type GoneRouteSource } from "./gone-route";
import {
  getRouteClaims,
  type GeneratedRouteSource,
  type RouteClaimKind,
} from "./route-claims";

export interface AnalyticsRouteProjectionSource
  extends GeneratedRouteSource, GoneRouteSource {
  readonly articles: readonly {
    readonly id: string;
    readonly seo: { readonly canonicalPath: string };
  }[];
  readonly taxonomy: {
    readonly categories: readonly {
      readonly id: string;
      readonly slug: string;
    }[];
  };
  readonly release: {
    readonly releaseId: string;
    readonly siteId: string;
    readonly defaultTheme: AnalyticsThemeId;
    readonly defaultSkin: string;
  };
}

export type SiteAnalyticsBaseContext = Omit<
  AnalyticsEventContext,
  "routeType"
>;

export interface SiteAnalyticsRouteProjection {
  readonly baseContext: SiteAnalyticsBaseContext;
  readonly routeTypesByPath: Readonly<Record<string, AnalyticsRouteType>>;
  readonly routeDestinationsByPath: Readonly<
    Record<string, AnalyticsRouteDestination>
  >;
}

export type AnalyticsRouteDestination =
  | { readonly destinationType: "article"; readonly destinationId: string }
  | { readonly destinationType: "category"; readonly destinationId: string };

const HTML_ROUTE_TYPES: Readonly<
  Partial<Record<RouteClaimKind, AnalyticsRouteType>>
> = Object.freeze({
  "fixed-home": "home",
  "fixed-archive": "archive",
  "fixed-search": "search",
  "fixed-not-found": "not-found",
  article: "article",
  category: "category",
  page: "static-page",
});
const analyticsSkinIds = new Set<string>(ANALYTICS_SKIN_IDS);

function addRoute(
  inventory: Record<string, AnalyticsRouteType>,
  path: string,
  routeType: AnalyticsRouteType,
) {
  if (Object.hasOwn(inventory, path)) {
    throw new Error(`Analytics route path is claimed more than once: ${path}`);
  }
  inventory[path] = routeType;
}

export function createSiteAnalyticsRouteProjection(
  bundle: AnalyticsRouteProjectionSource,
): SiteAnalyticsRouteProjection {
  if (!analyticsSkinIds.has(bundle.release.defaultSkin)) {
    throw new Error(`Unknown analytics skin: ${bundle.release.defaultSkin}`);
  }
  const routeTypesByPath: Record<string, AnalyticsRouteType> = {};
  for (const [path, claim] of getRouteClaims(bundle)) {
    if (claim.outputKind !== "html") continue;
    const routeType = HTML_ROUTE_TYPES[claim.kind];
    if (!routeType) throw new Error(`Unknown analytics route kind: ${claim.kind}`);
    addRoute(routeTypesByPath, path, routeType);
  }
  for (const gone of getGoneRoutes(bundle)) {
    addRoute(routeTypesByPath, gone.path, "retired");
  }
  const routeDestinationsByPath = Object.fromEntries([
    ...bundle.articles.map((article) => [
      article.seo.canonicalPath,
      Object.freeze({
        destinationType: "article" as const,
        destinationId: article.id,
      }),
    ] as const),
    ...bundle.taxonomy.categories.map((category) => [
      `/category/${category.slug}`,
      Object.freeze({
        destinationType: "category" as const,
        destinationId: category.id,
      }),
    ] as const),
  ]);

  return Object.freeze({
    baseContext: Object.freeze({
      eventContractVersion: ANALYTICS_EVENT_CONTRACT_VERSION,
      siteId: bundle.release.siteId,
      releaseId: bundle.release.releaseId,
      themeId: bundle.release.defaultTheme,
      skinId: bundle.release.defaultSkin as SiteAnalyticsBaseContext["skinId"],
    }),
    routeTypesByPath: Object.freeze(routeTypesByPath),
    routeDestinationsByPath: Object.freeze(routeDestinationsByPath),
  });
}

export function resolveAnalyticsRouteType(
  projection: SiteAnalyticsRouteProjection,
  pathname: string,
): AnalyticsRouteType {
  return projection.routeTypesByPath[pathname] ?? "not-found";
}
