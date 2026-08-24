import { readFileSync } from "node:fs";
import { join } from "node:path";

import { BuildTargetConfigError, type BuildTargetConfig } from "@content-foundry/site-core";

import { loadSiteRelease, loadValidatedSiteReleaseV3 } from "./load-site-release";
import {
  clearGeneratedSiteBuildArtifacts,
  prepareV3SiteBuildArtifacts,
  type SiteBuildArtifactPaths,
} from "./prepare-site-build";

export interface PrepareSiteReleaseOptions extends SiteBuildArtifactPaths {
  readonly immutableObjectDirectory?: string;
}

function declaresV3Release(releaseDirectory: string): boolean {
  try {
    const candidate = JSON.parse(
      readFileSync(join(releaseDirectory, "release.json"), "utf8"),
    ) as unknown;
    return (
      typeof candidate === "object" &&
      candidate !== null &&
      "contractVersion" in candidate &&
      candidate.contractVersion === "3.0.0"
    );
  } catch {
    return false;
  }
}

export async function prepareSiteRelease(
  config: BuildTargetConfig,
  options: PrepareSiteReleaseOptions,
): Promise<"2.0.0" | "3.0.0"> {
  if (!declaresV3Release(config.releaseDirectory)) {
    const context = loadSiteRelease(config);
    await clearGeneratedSiteBuildArtifacts(options);
    return context.contractVersion;
  }

  const context = loadValidatedSiteReleaseV3(config);
  const immutableObjectDirectory = options.immutableObjectDirectory?.trim();
  if (!immutableObjectDirectory) {
    throw new BuildTargetConfigError(
      "IMMUTABLE_MEDIA_DIR is required for contract 3.0.0",
    );
  }
  await prepareV3SiteBuildArtifacts(context.bundle, {
    ...options,
    immutableObjectDirectory,
    releaseDirectory: config.releaseDirectory,
  });
  return context.contractVersion;
}
