import { BuildTargetConfigError, type BuildTargetConfig } from "@content-foundry/site-core";

import { loadSiteRelease, loadValidatedSiteReleaseV3 } from "./load-site-release";
import {
  clearGeneratedSiteBuildArtifacts,
  prepareV3SiteBuildArtifacts,
  type SiteBuildArtifactPaths,
} from "./prepare-site-build";
import { declaresV3SiteRelease } from "./site-release-version";

export interface PrepareSiteReleaseOptions extends SiteBuildArtifactPaths {
  readonly immutableObjectDirectory?: string;
}

export async function prepareSiteRelease(
  config: BuildTargetConfig,
  options: PrepareSiteReleaseOptions,
): Promise<"2.0.0" | "3.0.0"> {
  if (!declaresV3SiteRelease(config.releaseDirectory)) {
    const context = loadSiteRelease(config);
    await clearGeneratedSiteBuildArtifacts(options);
    return context.contractVersion;
  }

  const context = loadValidatedSiteReleaseV3(config);
  const immutableObjectDirectory = options.immutableObjectDirectory?.trim();
  const requiresImmutableObjects = context.bundle.mediaManifest.items.some(
    ({ source }) => source === "immutable-object",
  );
  if (requiresImmutableObjects && !immutableObjectDirectory) {
    throw new BuildTargetConfigError(
      "IMMUTABLE_MEDIA_DIR is required for contract 3.0.0",
    );
  }
  await prepareV3SiteBuildArtifacts(context.bundle, {
    ...options,
    immutableObjectDirectory: immutableObjectDirectory ?? config.releaseDirectory,
    releaseDirectory: config.releaseDirectory,
  });
  return context.contractVersion;
}
