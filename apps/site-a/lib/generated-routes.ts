import {
  getRouteClaims,
  type GeneratedRouteSource,
  type RouteClaimKind,
} from "./route-claims";

const navigableKinds = new Set<RouteClaimKind>([
  "fixed-home",
  "article",
  "category",
  "page",
]);

export function getGeneratedRoutes(
  bundle: GeneratedRouteSource,
): ReadonlySet<string> {
  return new Set(
    [...getRouteClaims(bundle)]
      .filter(([, claim]) => navigableKinds.has(claim.kind))
      .map(([path]) => path),
  );
}
