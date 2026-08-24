import type { V3ReleaseConsumerContext } from "./validate-v3-release-consumer-context.js";
import { validateV3ReleaseConsumerContext } from "./validate-v3-release-consumer-context.js";
import {
  type V4PresentationReadinessContext,
  validateV4PresentationReadiness,
} from "./validate-v4-presentation-readiness.js";
import type { LoadedReleaseBundleV4 } from "./validate-v4-presentation-structure.js";

export interface V4ReleaseConsumerContext extends V3ReleaseConsumerContext {
  readonly presentationReadiness: V4PresentationReadinessContext;
}

export function validateV4ReleaseConsumerContext(
  bundle: LoadedReleaseBundleV4,
  context: V4ReleaseConsumerContext,
): LoadedReleaseBundleV4 {
  // V4 retains the complete v3 structured-content shape after exact v4 schema
  // dispatch, so the existing route and niche registry checks remain normative.
  validateV3ReleaseConsumerContext(
    bundle as unknown as Parameters<typeof validateV3ReleaseConsumerContext>[0],
    context,
  );
  validateV4PresentationReadiness(bundle, context.presentationReadiness);
  return bundle;
}
