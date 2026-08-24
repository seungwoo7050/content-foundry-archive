import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { type ImmutableObjectLoader } from "./read-immutable-object-media-source.js";

function isWithin(root: string, target: string) {
  const path = relative(root, target);
  return path !== "" && !isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`);
}

function isMissing(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error.code === "ENOENT" || error.code === "ENOTDIR")
  );
}

export function createFilesystemImmutableObjectLoader(
  root: string,
): ImmutableObjectLoader {
  return async (key) => {
    const canonicalRoot = await realpath(root);
    const candidate = resolve(canonicalRoot, key);
    if (!isWithin(canonicalRoot, candidate)) return null;

    let canonicalObject: string;
    try {
      canonicalObject = await realpath(candidate);
    } catch (error) {
      if (isMissing(error)) return null;
      throw error;
    }
    if (!isWithin(canonicalRoot, canonicalObject)) return null;
    if (!(await stat(canonicalObject)).isFile()) return null;
    return readFile(canonicalObject);
  };
}
