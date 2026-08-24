import type { LoadedReleaseBundle } from "@content-foundry/content-contract";

import { validateDispositionSourceClaims } from "./validate-disposition-source-claims";
import { validateDispositionTargets } from "./validate-disposition-targets";
import { validateNavigationDestinations } from "./validate-navigation-destinations";

export function validateSiteRouteGraph(
  bundle: LoadedReleaseBundle,
): LoadedReleaseBundle {
  validateDispositionSourceClaims(bundle);
  validateDispositionTargets(bundle);
  validateNavigationDestinations(bundle);
  return bundle;
}
