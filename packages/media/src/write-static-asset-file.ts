import { lstat, mkdir, open, readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

import { ContractError } from "@content-foundry/content-contract";

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

export async function writeStaticAssetFile(
  outputRoot: string,
  relativePath: string,
  bytes: Uint8Array,
  recordPath: string,
): Promise<void> {
  const segments = relativePath.split("/");
  const filename = segments.pop();
  if (
    isAbsolute(relativePath) ||
    filename === undefined ||
    filename.length === 0 ||
    segments.some((segment) => segment.length === 0 || segment === "..")
  ) {
    throw failure(recordPath, "output path is not a safe relative file");
  }

  try {
    await ensureDirectory(outputRoot, recordPath, true);
    let directory = outputRoot;
    for (const segment of segments) {
      directory = join(directory, segment);
      await ensureDirectory(directory, recordPath);
    }
    const target = join(directory, filename);
    try {
      const handle = await open(target, "wx");
      try {
        await handle.writeFile(bytes);
      } finally {
        await handle.close();
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const entry = await lstat(target);
      if (entry.isSymbolicLink() || !entry.isFile()) {
        throw failure(recordPath, "output file is not a safe regular file");
      }
      if (!(await readFile(target)).equals(bytes)) {
        throw failure(recordPath, "output file does not match verified bytes");
      }
    }
  } catch (error) {
    if (error instanceof ContractError) throw error;
    throw failure(recordPath, "cannot write verified image bytes");
  }
}
