import type { LoadedReleaseBundle } from "@content-foundry/content-contract";

import { getRouteClaims, type RouteClaimKind } from "./route-claims";

const navigableKinds = new Set<RouteClaimKind>([
  "fixed-home",
  "article",
  "category",
  "page",
]);

export function getGeneratedRoutes(
  bundle: LoadedReleaseBundle,
): ReadonlySet<string> {
  return new Set(
    [...getRouteClaims(bundle)]
      .filter(([, claim]) => navigableKinds.has(claim.kind))
      .map(([path]) => path),
  );
}
