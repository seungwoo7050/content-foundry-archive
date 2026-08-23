import { ContractError, type ContractIssue } from "./errors.js";
import {
  readReleaseBundleDocuments,
  type ReleaseBundleDocuments,
} from "./read-bundle-documents.js";
import { validateContentReferences } from "./validate-content-references.js";
import { validateContentSemantics } from "./validate-content-semantics.js";
import { validatePublicKeys } from "./validate-public-keys.js";
import { validateReleaseIdentity } from "./validate-release-identity.js";
import { validateRouteDispositions } from "./validate-route-dispositions.js";

export type LoadedReleaseBundle = ReleaseBundleDocuments;

export interface LoadReleaseBundleOptions {
  readonly expectedSiteId?: string;
  readonly expectedReleaseId?: string;
}

export function loadReleaseBundle(
  root: string,
  options: LoadReleaseBundleOptions = {},
): LoadedReleaseBundle {
  const bundle = readReleaseBundleDocuments(root);
  validateReleaseIdentity(bundle);
  validatePublicKeys(bundle);
  validateContentReferences(bundle);
  validateContentSemantics(bundle);
  validateRouteDispositions(bundle);

  const issues: ContractIssue[] = [];
  if (options.expectedSiteId && options.expectedSiteId !== bundle.release.siteId) {
    issues.push({
      path: "/release/siteId",
      message: `expected ${options.expectedSiteId}, got ${bundle.release.siteId}`,
    });
  }
  if (
    options.expectedReleaseId &&
    options.expectedReleaseId !== bundle.release.releaseId
  ) {
    issues.push({
      path: "/release/releaseId",
      message: `expected ${options.expectedReleaseId}, got ${bundle.release.releaseId}`,
    });
  }
  if (issues.length > 0) {
    throw new ContractError("REFERENCE_INVALID", "Unexpected release identity", issues);
  }
  return bundle;
}
