import {
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join, posix, relative, sep } from "node:path";

import canonicalize from "canonicalize";

import { resolveSupportedContractVersion } from "./contract-version.js";
import { ContractError } from "./errors.js";
import type { PublicSiteReleaseManifest } from "./generated/release.js";
import { validateContractDocumentForVersion } from "./validate-document.js";

const ZERO_CHECKSUM = `sha256:${"0".repeat(64)}`;
const MANIFEST_LINE = /^([0-9a-f]{64})  ([^\\]+)$/;

interface ChecksumEntry {
  readonly hash: string;
  readonly path: string;
}

const fail = (message: string): never => {
  throw new ContractError("INTEGRITY_FAILED", message);
};

function readIntegrityFile(root: string, path: string): Buffer {
  try {
    return readFileSync(join(root, path));
  } catch (error) {
    return fail(`Cannot read ${path}: ${String(error)}`);
  }
}

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

function collectFiles(root: string, directory = root): readonly string[] {
  return readdirSync(directory).flatMap((name) => {
    const absolute = join(directory, name);
    const stat = lstatSync(absolute);
    const path = relative(root, absolute).split(sep).join("/");
    if (stat.isSymbolicLink()) fail(`Symbolic link is forbidden: ${path}`);
    if (stat.isDirectory()) return collectFiles(root, absolute);
    if (!stat.isFile()) fail(`Non-regular bundle entry: ${path}`);
    return [path];
  });
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

  const version = resolveSupportedContractVersion(release.contractVersion);

  const checksums = readIntegrityFile(root, "checksums.txt");
  const entries = parseChecksums(checksums);
  const listed = entries.map((entry) => entry.path);
  let actual: readonly string[];
  try {
    actual = collectFiles(root)
      .filter((path) => path !== "release.json" && path !== "checksums.txt")
      .sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)));
  } catch (error) {
    if (error instanceof ContractError) throw error;
    return fail(`Cannot inspect bundle files: ${String(error)}`);
  }
  if (JSON.stringify(actual) !== JSON.stringify(listed)) {
    fail("Bundle file set does not match checksums.txt");
  }

  for (const entry of entries) {
    const hash = createHash("sha256")
      .update(readIntegrityFile(root, entry.path))
      .digest("hex");
    if (hash !== entry.hash) fail(`Checksum mismatch: ${entry.path}`);
  }

  const expected = release.bundleChecksum;
  release.bundleChecksum = ZERO_CHECKSUM;
  const normalized = canonicalize(release);
  if (normalized === undefined) {
    throw new ContractError(
      "INTEGRITY_FAILED",
      "release.json cannot be canonicalized",
    );
  }
  const actualBundleChecksum = `sha256:${createHash("sha256")
    .update(normalized)
    .update("\n")
    .update(checksums)
    .digest("hex")}`;
  if (actualBundleChecksum !== expected) fail("Bundle checksum mismatch");

  release.bundleChecksum = expected;
  return validateContractDocumentForVersion(version, "release", release);
}
