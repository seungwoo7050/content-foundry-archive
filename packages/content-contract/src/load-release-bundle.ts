import { ContractError, type ContractIssue } from "./errors.js";
import {
  readReleaseBundleDocuments,
  readReleaseBundleDocumentsForVersion,
  readSupportedReleaseBundleDocuments,
  type ReleaseBundleDocuments,
  type ReleaseBundleDocumentsByVersion,
} from "./read-bundle-documents.js";
import type { SupportedContractVersion } from "./contract-version.js";
import { validateContentReferences } from "./validate-content-references.js";
import { validateContentSemantics } from "./validate-content-semantics.js";
import { validateExternalActionUrls } from "./validate-external-action-urls.js";
import { validateGalleryAltText } from "./validate-gallery-alt-text.js";
import { validatePublicKeys } from "./validate-public-keys.js";
import { validateReleaseIdentity } from "./validate-release-identity.js";
import { validateRouteDispositions } from "./validate-route-dispositions.js";
import {
  type LoadedReleaseBundleV3,
  type V3ReleaseConsumerContext,
  validateV3ReleaseConsumerContext,
} from "./validate-v3-release-consumer-context.js";

export type LoadedReleaseBundle = ReleaseBundleDocuments;

export interface LoadReleaseBundleOptions {
  readonly expectedSiteId?: string;
  readonly expectedReleaseId?: string;
}

export interface LoadV3ReleaseBundleOptions extends LoadReleaseBundleOptions {
  readonly resolveConsumerContext: (
    bundle: LoadedReleaseBundleV3,
  ) => V3ReleaseConsumerContext;
}

export interface LoadSupportedReleaseBundleOptions
  extends LoadReleaseBundleOptions {
  readonly resolveV3ConsumerContext: (
    bundle: LoadedReleaseBundleV3,
  ) => V3ReleaseConsumerContext;
}

export type LoadedSupportedReleaseBundle =
  ReleaseBundleDocumentsByVersion[SupportedContractVersion];

type VersionedReleaseBundle =
  ReleaseBundleDocumentsByVersion[keyof ReleaseBundleDocumentsByVersion];

function validateLoadedReleaseBundle<T extends VersionedReleaseBundle>(
  bundle: T,
  options: LoadReleaseBundleOptions = {},
): T {
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

export function validateV3ReleaseBundle(
  bundle: ReleaseBundleDocumentsByVersion["3.0.0"],
  options: LoadReleaseBundleOptions = {},
): ReleaseBundleDocumentsByVersion["3.0.0"] {
  return validateStructuredReleaseBundle(bundle, options);
}

function validateStructuredReleaseBundle<
  T extends
    | ReleaseBundleDocumentsByVersion["3.0.0"]
    | ReleaseBundleDocumentsByVersion["4.0.0"],
>(bundle: T, options: LoadReleaseBundleOptions = {}): T {
  const validated = validateLoadedReleaseBundle(bundle, options);
  validateGalleryAltText(validated);
  validateExternalActionUrls(validated);
  return validated;
}

export function loadReleaseBundleForVersion(
  version: "2.0.0",
  root: string,
  options?: LoadReleaseBundleOptions,
): ReleaseBundleDocumentsByVersion["2.0.0"];
export function loadReleaseBundleForVersion(
  version: "3.0.0",
  root: string,
  options?: LoadReleaseBundleOptions,
): ReleaseBundleDocumentsByVersion["3.0.0"];
export function loadReleaseBundleForVersion(
  version: "4.0.0",
  root: string,
  options?: LoadReleaseBundleOptions,
): ReleaseBundleDocumentsByVersion["4.0.0"];
export function loadReleaseBundleForVersion(
  version: keyof ReleaseBundleDocumentsByVersion,
  root: string,
  options: LoadReleaseBundleOptions = {},
): VersionedReleaseBundle {
  if (version === "2.0.0") {
    return validateLoadedReleaseBundle(
      readReleaseBundleDocumentsForVersion("2.0.0", root),
      options,
    );
  }
  if (version === "3.0.0") {
    return validateV3ReleaseBundle(
      readReleaseBundleDocumentsForVersion("3.0.0", root),
      options,
    );
  }
  if (version === "4.0.0") {
    return validateStructuredReleaseBundle(
      readReleaseBundleDocumentsForVersion("4.0.0", root),
      options,
    );
  }

  const unhandledVersion: never = version;
  throw new Error(`Unhandled registered contract version: ${unhandledVersion}`);
}

export function loadReleaseBundle(
  root: string,
  options: LoadReleaseBundleOptions = {},
): LoadedReleaseBundle {
  return validateLoadedReleaseBundle(readReleaseBundleDocuments(root), options);
}

export function loadV3ReleaseBundle(
  root: string,
  options: LoadV3ReleaseBundleOptions,
): LoadedReleaseBundleV3 {
  const { resolveConsumerContext, ...identityOptions } = options;
  const bundle = loadReleaseBundleForVersion("3.0.0", root, identityOptions);
  return validateV3ReleaseConsumerContext(
    bundle,
    resolveConsumerContext(bundle),
  );
}

export function loadSupportedReleaseBundle(
  root: string,
  options: LoadSupportedReleaseBundleOptions,
): LoadedSupportedReleaseBundle {
  const { resolveV3ConsumerContext, ...identityOptions } = options;
  const bundle = readSupportedReleaseBundleDocuments(root);
  const version = bundle.release.contractVersion;
  if (version === "2.0.0") {
    return validateLoadedReleaseBundle(
      bundle as ReleaseBundleDocumentsByVersion["2.0.0"],
      identityOptions,
    );
  }
  if (version === "3.0.0") {
    const validated = validateV3ReleaseBundle(
      bundle as ReleaseBundleDocumentsByVersion["3.0.0"],
      identityOptions,
    );
    return validateV3ReleaseConsumerContext(
      validated,
      resolveV3ConsumerContext(validated),
    ) as unknown as LoadedSupportedReleaseBundle;
  }

  const unhandledVersion: never = version;
  throw new Error(`Unhandled supported release version: ${unhandledVersion}`);
}
