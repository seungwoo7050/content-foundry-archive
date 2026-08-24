import { BuildTargetConfigError, type BuildTargetConfig } from "@content-foundry/site-core";

import { loadValidatedSiteRelease } from "./load-site-release";
import {
  clearGeneratedSiteBuildArtifacts,
  prepareV3SiteBuildArtifacts,
  type SiteBuildArtifactPaths,
} from "./prepare-site-build";
import { withRouteDispositionArtifact } from "./route-disposition-artifact-transaction";
import { resolveSiteLaunchConfig } from "./site-launch-config";

export interface PrepareSiteReleaseOptions extends SiteBuildArtifactPaths {
  readonly immutableObjectDirectory?: string;
  readonly environment?: Readonly<Record<string, string | undefined>>;
}

export async function prepareSiteRelease(
  config: BuildTargetConfig,
  options: PrepareSiteReleaseOptions,
): Promise<"2.0.0" | "3.0.0"> {
  const context = loadValidatedSiteRelease(config);
  resolveSiteLaunchConfig(context, options.environment ?? {});
  if (context.contractVersion === "2.0.0") {
    return withRouteDispositionArtifact(
      options.dispositionPath,
      context.bundle,
      async () => {
        await clearGeneratedSiteBuildArtifacts(options);
        return context.contractVersion;
      },
    );
  }

  const immutableObjectDirectory = options.immutableObjectDirectory?.trim();
  const requiresImmutableObjects = context.bundle.mediaManifest.items.some(
    ({ source }) => source === "immutable-object",
  );
  if (requiresImmutableObjects && !immutableObjectDirectory) {
    throw new BuildTargetConfigError(
      "IMMUTABLE_MEDIA_DIR is required for contract 3.0.0",
    );
  }
  return withRouteDispositionArtifact(
    options.dispositionPath,
    context.bundle,
    async () => {
      await prepareV3SiteBuildArtifacts(context.bundle, {
        ...options,
        immutableObjectDirectory:
          immutableObjectDirectory ?? config.releaseDirectory,
        releaseDirectory: config.releaseDirectory,
      });
      return context.contractVersion;
    },
  );
}
