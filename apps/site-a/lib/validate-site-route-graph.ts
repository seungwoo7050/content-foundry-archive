import {
  type DispositionRouteSource,
  validateDispositionSourceClaims,
} from "./validate-disposition-source-claims";
import { validateDispositionTargets } from "./validate-disposition-targets";
import {
  type NavigationRouteSource,
  validateNavigationDestinations,
} from "./validate-navigation-destinations";

export type SiteRouteGraphSource = DispositionRouteSource & NavigationRouteSource;

export function validateSiteRouteGraph<T extends SiteRouteGraphSource>(bundle: T): T {
  validateDispositionSourceClaims(bundle);
  validateDispositionTargets(bundle);
  validateNavigationDestinations(bundle);
  return bundle;
}
