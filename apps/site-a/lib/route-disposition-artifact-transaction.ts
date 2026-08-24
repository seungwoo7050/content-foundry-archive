import { randomUUID } from "node:crypto";
import { lstat, mkdir, rename, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

import { ContractError } from "@content-foundry/content-contract";

import type { RouteDispositionArtifactSource } from "./route-disposition-artifact";
import { writeRouteDispositionArtifact } from "./route-disposition-artifact-file";

function fail(message: string): never {
  throw new ContractError("BUILD_FAILED", message, [
    {
      path: "/routeDispositions",
      message: "route disposition transaction is unavailable",
    },
  ]);
}

async function hasOwnedFile(path: string): Promise<boolean> {
  try {
    if (!(await lstat(path)).isFile()) fail("Disposition target is not an owned file");
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function withRouteDispositionArtifact<T>(
  path: string,
  bundle: RouteDispositionArtifactSource,
  publish: () => Promise<T>,
): Promise<T> {
  const directory = dirname(path);
  const backup = join(directory, `.route-dispositions.${randomUUID()}.backup`);
  let previousExists = false;
  let replacementPublished = false;

  try {
    await mkdir(directory, { recursive: true });
    if (!(await lstat(directory)).isDirectory()) {
      fail("Disposition build path is not an owned directory");
    }
    previousExists = await hasOwnedFile(path);
    if (previousExists) await rename(path, backup);
  } catch (error) {
    if (error instanceof ContractError) throw error;
    fail("Disposition artifacts cannot be transacted");
  }

  try {
    await writeRouteDispositionArtifact(path, bundle);
    replacementPublished = true;
    const result = await publish();
    if (previousExists) await rm(backup, { force: true }).catch(() => undefined);
    return result;
  } catch (error) {
    try {
      if (replacementPublished) await rm(path, { force: true });
      if (previousExists) await rename(backup, path);
    } catch {
      fail(`Disposition artifacts cannot be restored; previous file remains at ${backup}`);
    }
    throw error;
  }
}
