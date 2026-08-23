import { readFileSync } from "node:fs";
import { join, posix } from "node:path";

import { ContractError } from "./errors.js";
import type { PublicSiteReleaseManifest } from "./generated/release.js";
import {
  SUPPORTED_CONTRACT_VERSION,
  validateContractDocument,
} from "./validate-document.js";

const MANIFEST_LINE = /^([0-9a-f]{64})  ([^\\]+)$/;

interface ChecksumEntry {
  readonly hash: string;
  readonly path: string;
}

const fail = (message: string): never => {
  throw new ContractError("INTEGRITY_FAILED", message);
};

function parseChecksums(bytes: Buffer): readonly ChecksumEntry[] {
  const text = bytes.toString("utf8");
  if (!text.endsWith("\n") || text.includes("\r")) {
    fail("checksums.txt must use LF and end with LF");
  }

  const entries = text.slice(0, -1).split("\n").map((line) => {
    const match = MANIFEST_LINE.exec(line);
    if (!match) {
      throw new ContractError(
        "INTEGRITY_FAILED",
        `Invalid checksums.txt line: ${line}`,
      );
    }
    const hash = match[1];
    const path = match[2];
    if (!hash || !path) {
      throw new ContractError(
        "INTEGRITY_FAILED",
        "Incomplete checksums.txt entry",
      );
    }
    if (
      path.startsWith("/") ||
      path.startsWith("./") ||
      path.includes("//") ||
      path.split("/").includes("..") ||
      posix.normalize(path) !== path ||
      path === "release.json" ||
      path === "checksums.txt"
    ) {
      fail(`Unsafe checksums.txt path: ${path}`);
    }
    return { hash, path };
  });

  const paths = entries.map((entry) => entry.path);
  if (new Set(paths).size !== paths.length) fail("Duplicate checksum path");
  const sorted = [...paths].sort((a, b) =>
    Buffer.compare(Buffer.from(a), Buffer.from(b)),
  );
  if (paths.some((path, index) => path !== sorted[index])) {
    fail("Checksum paths are not UTF-8 byte sorted");
  }
  return entries;
}

export function verifyReleaseIntegrity(
  root: string,
): PublicSiteReleaseManifest {
  let release: Record<string, unknown>;
  try {
    release = JSON.parse(readFileSync(join(root, "release.json"), "utf8")) as Record<
      string,
      unknown
    >;
  } catch (error) {
    throw new ContractError("CONTRACT_INVALID", "Cannot parse release.json", [
      { path: "/release.json", message: String(error) },
    ]);
  }

  if (release.contractVersion !== SUPPORTED_CONTRACT_VERSION) {
    throw new ContractError(
      "CONTRACT_UNSUPPORTED",
      `Unsupported contract version: ${String(release.contractVersion)}`,
    );
  }

  const checksums = readFileSync(join(root, "checksums.txt"));
  parseChecksums(checksums);
  return validateContractDocument("release", release);
}
