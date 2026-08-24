import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { ContractError } from "@content-foundry/content-contract";

import { type ImageMediaRecord } from "./verify-media-byte-identity.js";

export type MediaSourceReader = (
  media: ImageMediaRecord,
  recordPath: string,
) => Promise<Uint8Array>;

function failure(
  media: ImageMediaRecord,
  recordPath: string,
  field: "path" | "source",
  message: string,
) {
  return new ContractError(
    "INTEGRITY_FAILED",
    `Bundle media source failed: ${media.id}`,
    [{ path: `${recordPath}/${field}`, message }],
  );
}

function isWithin(root: string, target: string) {
  const path = relative(root, target);
  return path !== "" && !isAbsolute(path) && path !== ".." && !path.startsWith(`..${sep}`);
}

export function createBundleMediaSourceReader(root: string): MediaSourceReader {
  return async (media, recordPath) => {
    if (media.source !== "bundle") {
      throw failure(
        media,
        recordPath,
        "source",
        `expected bundle source, got ${media.source}`,
      );
    }

    try {
      const canonicalRoot = await realpath(root);
      const candidate = resolve(canonicalRoot, media.path);
      if (!isWithin(canonicalRoot, candidate)) {
        throw failure(media, recordPath, "path", "path escapes the release root");
      }

      const canonicalSource = await realpath(candidate);
      if (!isWithin(canonicalRoot, canonicalSource)) {
        throw failure(media, recordPath, "path", "path escapes the release root");
      }
      if (!(await stat(canonicalSource)).isFile()) {
        throw failure(media, recordPath, "path", "path is not a regular file");
      }
      return await readFile(canonicalSource);
    } catch (error) {
      if (error instanceof ContractError) throw error;
      throw failure(media, recordPath, "path", "bundle source is unavailable");
    }
  };
}
