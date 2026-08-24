import { randomUUID } from "node:crypto";
import { lstat, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

import { ContractError } from "@content-foundry/content-contract";

import {
  createRouteDispositionArtifact,
  type RouteDispositionArtifactSource,
} from "./route-disposition-artifact";

function fail(): never {
  throw new ContractError("BUILD_FAILED", "Route dispositions cannot be written", [
    {
      path: "/routeDispositions",
      message: "route disposition artifact is unavailable",
    },
  ]);
}

export async function writeRouteDispositionArtifact(
  path: string,
  bundle: RouteDispositionArtifactSource,
): Promise<void> {
  const source = `${JSON.stringify(createRouteDispositionArtifact(bundle), null, 2)}\n`;
  const directory = dirname(path);
  const temporary = join(directory, `.${basename(path)}.${randomUUID()}.tmp`);
  try {
    await mkdir(directory, { recursive: true });
    if (!(await lstat(directory)).isDirectory()) fail();
    await writeFile(temporary, source, { encoding: "utf8", flag: "wx" });
    await rename(temporary, path);
  } catch {
    await rm(temporary, { force: true }).catch(() => undefined);
    fail();
  }
}
