import { lstat, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  ContractError,
  type LoadedReleaseBundleV3,
} from "@content-foundry/content-contract";
import {
  createFilesystemImmutableObjectLoader,
  type ResponsiveImageAsset,
} from "@content-foundry/media";

import { prepareSiteMedia } from "./prepare-site-media";
import { writeSiteMediaProjection } from "./site-media-projection";

export interface SiteBuildArtifactPaths {
  readonly projectionPath: string;
  readonly publicDirectory: string;
}

export interface PrepareV3SiteBuildOptions extends SiteBuildArtifactPaths {
  readonly immutableObjectDirectory: string;
  readonly releaseDirectory: string;
}

function failure(message: string): ContractError {
  return new ContractError("BUILD_FAILED", message, [
    { path: "/siteBuild", message: "generated artifacts are unavailable" },
  ]);
}

async function existingDirectory(path: string): Promise<boolean> {
  try {
    if (!(await lstat(path)).isDirectory()) {
      throw failure("Generated media path is not a directory");
    }
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return false;
    }
    throw error;
  }
}

async function ensureOwnedDirectory(path: string, label: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
    if (!(await lstat(path)).isDirectory()) {
      throw failure(`${label} is not an owned directory`);
    }
  } catch (error) {
    if (error instanceof ContractError) throw error;
    throw failure(`${label} is unavailable`);
  }
}

function normalizeFailure(error: unknown): never {
  if (error instanceof ContractError) throw error;
  throw failure("Site build artifacts cannot be prepared");
}

export async function prepareV3SiteBuildArtifacts(
  bundle: LoadedReleaseBundleV3,
  options: PrepareV3SiteBuildOptions,
): Promise<readonly ResponsiveImageAsset[]> {
  const buildDirectory = dirname(options.projectionPath);
  await ensureOwnedDirectory(buildDirectory, "Generated build path");
  await ensureOwnedDirectory(options.publicDirectory, "Public output path");
  const stagingRoot = await mkdtemp(join(buildDirectory, "media-stage-"));
  const stagedMedia = join(stagingRoot, "_media");
  const previousMedia = join(stagingRoot, "previous-media");
  const publicMedia = join(options.publicDirectory, "_media");
  let previousExists = false;
  let replacementPublished = false;
  let preserveStaging = false;

  try {
    const registry = await prepareSiteMedia(bundle, {
      immutableObjectLoader: createFilesystemImmutableObjectLoader(
        options.immutableObjectDirectory,
      ),
      publicDirectory: stagingRoot,
      releaseDirectory: options.releaseDirectory,
    });
    await mkdir(stagedMedia, { recursive: true });
    previousExists = await existingDirectory(publicMedia);
    if (previousExists) await rename(publicMedia, previousMedia);

    try {
      await rename(stagedMedia, publicMedia);
      replacementPublished = true;
      const assets = [...registry.values()];
      await writeSiteMediaProjection(options.projectionPath, bundle, assets);
      return assets;
    } catch (error) {
      try {
        if (replacementPublished) {
          await rm(publicMedia, { recursive: true, force: true });
        }
        if (previousExists) await rename(previousMedia, publicMedia);
      } catch {
        preserveStaging = previousExists;
        throw failure(
          previousExists
            ? `Site build artifacts cannot be restored; previous media remains at ${previousMedia}`
            : "Site build artifacts cannot be restored",
        );
      }
      return normalizeFailure(error);
    }
  } catch (error) {
    return normalizeFailure(error);
  } finally {
    if (!preserveStaging) {
      await rm(stagingRoot, { recursive: true, force: true });
    }
  }
}

export async function clearGeneratedSiteBuildArtifacts(
  paths: SiteBuildArtifactPaths,
): Promise<void> {
  try {
    await ensureOwnedDirectory(dirname(paths.projectionPath), "Generated build path");
    await ensureOwnedDirectory(paths.publicDirectory, "Public output path");
    await existingDirectory(join(paths.publicDirectory, "_media"));
    await rm(paths.projectionPath, { force: true });
    await rm(join(paths.publicDirectory, "_media"), {
      recursive: true,
      force: true,
    });
  } catch {
    throw failure("Generated site build artifacts cannot be cleared");
  }
}
