import {
  getRouteClaims,
  type GeneratedRouteSource,
} from "./route-claims";

export function getGeneratedRoutes(
  bundle: GeneratedRouteSource,
): ReadonlySet<string> {
  return new Set(
    [...getRouteClaims(bundle)]
      .filter(([, claim]) => claim.navigable)
      .map(([path]) => path),
  );
}
