import type { LoadedReleaseBundle } from "@content-foundry/content-contract";

import { validateDispositionSourceClaims } from "./validate-disposition-source-claims";
import { validateDispositionTargets } from "./validate-disposition-targets";

export function validateSiteRouteGraph(
  bundle: LoadedReleaseBundle,
): LoadedReleaseBundle {
  validateDispositionSourceClaims(bundle);
  validateDispositionTargets(bundle);
  return bundle;
}
