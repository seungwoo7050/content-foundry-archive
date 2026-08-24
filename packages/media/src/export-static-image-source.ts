import { lstat, mkdir, open, readFile } from "node:fs/promises";
import { basename, join } from "node:path";

import { ContractError } from "@content-foundry/content-contract";

import {
  projectStaticImageAsset,
  type StaticImageAsset,
} from "./project-static-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

function failure(recordPath: string, message: string) {
  return new ContractError("BUILD_FAILED", "Static image export failed", [
    { path: recordPath, message },
  ]);
}

async function ensureDirectory(path: string, recordPath: string, recursive = false) {
  try {
    await mkdir(path, { recursive });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
  const entry = await lstat(path);
  if (entry.isSymbolicLink() || !entry.isDirectory()) {
    throw failure(recordPath, "output path is not a safe directory");
  }
}

export async function exportStaticImageSource(
  source: VerifiedImageSource,
  outputRoot: string,
  recordPath: string,
): Promise<StaticImageAsset> {
  const asset = projectStaticImageAsset(source, recordPath);
  try {
    await ensureDirectory(outputRoot, recordPath, true);
    const mediaRoot = join(outputRoot, "_media");
    const hashRoot = join(mediaRoot, source.media.sha256);
    await ensureDirectory(mediaRoot, recordPath);
    await ensureDirectory(hashRoot, recordPath);
    const target = join(hashRoot, basename(asset.relativePath));

    try {
      const handle = await open(target, "wx");
      try {
        await handle.writeFile(source.bytes);
      } finally {
        await handle.close();
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const entry = await lstat(target);
      if (entry.isSymbolicLink() || !entry.isFile()) {
        throw failure(recordPath, "output file is not a safe regular file");
      }
      if (!(await readFile(target)).equals(source.bytes)) {
        throw failure(recordPath, "output file does not match verified bytes");
      }
    }
    return asset;
  } catch (error) {
    if (error instanceof ContractError) throw error;
    throw failure(recordPath, "cannot write verified image bytes");
  }
}
