import type { ReleaseBundleDocumentsByVersion } from "./read-bundle-documents.js";
import { validateInternalActionRoutes } from "./validate-internal-action-routes.js";
import { validateNicheConsumerRegistry } from "./validate-niche-consumer-registry.js";

export type LoadedReleaseBundleV3 = ReleaseBundleDocumentsByVersion["3.0.0"];

export interface V3ReleaseConsumerContext {
  readonly generatedRoutes: ReadonlySet<string>;
  readonly nicheComponentRegistry: Readonly<
    Record<string, readonly string[]>
  >;
}

export function validateV3ReleaseConsumerContext(
  bundle: LoadedReleaseBundleV3,
  context: V3ReleaseConsumerContext,
): LoadedReleaseBundleV3 {
  validateInternalActionRoutes(bundle, context.generatedRoutes);
  validateNicheConsumerRegistry(bundle, context.nicheComponentRegistry);
  return bundle;
}
