import {
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { createHash } from "node:crypto";
import { join, posix, relative, sep } from "node:path";
import { TextDecoder } from "node:util";

import canonicalize from "canonicalize";

import {
  resolveSupportedContractVersion,
  type SupportedContractVersion,
} from "./contract-version.js";
import { ContractError } from "./errors.js";
import type { PublicSiteReleaseManifest as PublicSiteReleaseManifestV3 } from "./generated/3.0.0/release.js";
import type { PublicSiteReleaseManifest } from "./generated/release.js";
import { validateBundleLayout } from "./validate-bundle-layout.js";
import {
  validateContractDocumentForVersion,
} from "./validate-document.js";

const ZERO_CHECKSUM = `sha256:${"0".repeat(64)}`;
const MANIFEST_LINE = /^([0-9a-f]{64})  ([^\\]+)$/;
const RELEASE_DECODER = new TextDecoder("utf-8", {
  fatal: true,
  ignoreBOM: true,
});

interface ChecksumEntry {
  readonly hash: string;
  readonly path: string;
}

interface ParsedReleaseManifest {
  readonly release: Record<string, unknown>;
  readonly source: string;
}

interface ReleaseManifestByVersion {
  readonly "2.0.0": PublicSiteReleaseManifest;
  readonly "3.0.0": PublicSiteReleaseManifestV3;
}

export type SupportedReleaseManifest =
  ReleaseManifestByVersion[SupportedContractVersion];

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

function countTopLevelField(source: string, field: string) {
  const containers: string[] = [];
  let count = 0;

  for (let index = 0; index < source.length; index += 1) {
    const token = source[index];
    if (token === '"') {
      const start = index;
      for (index += 1; index < source.length; index += 1) {
        if (source[index] === "\\") {
          index += 1;
        } else if (source[index] === '"') {
          break;
        }
      }
      let next = index + 1;
      while (/[\t\n\r ]/.test(source[next] ?? "")) next += 1;
      if (
        containers.length === 1 &&
        containers[0] === "{" &&
        source[next] === ":" &&
        JSON.parse(source.slice(start, index + 1)) === field
      ) {
        count += 1;
      }
    } else if (token === "{" || token === "[") {
      containers.push(token);
    } else if (token === "}" || token === "]") {
      containers.pop();
    }
  }
  return count;
}

function readReleaseManifest(root: string): ParsedReleaseManifest {
  let bytes: Buffer;
  try {
    bytes = readFileSync(join(root, "release.json"));
  } catch (error) {
    throw new ContractError("CONTRACT_INVALID", "Cannot parse release.json", [
      { path: "/release.json", message: String(error) },
    ]);
  }

  let source: string;
  try {
    source = RELEASE_DECODER.decode(bytes);
  } catch {
    return fail("release.json must be valid UTF-8");
  }

  try {
    const release = JSON.parse(source) as Record<string, unknown>;
    return { release, source };
  } catch (error) {
    throw new ContractError("CONTRACT_INVALID", "Cannot parse release.json", [
      { path: "/release.json", message: String(error) },
    ]);
  }
}

function verifyReleaseIntegrityWithManifest(
  root: string,
  release: Record<string, unknown>,
  releaseSource: string,
) {
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

  validateBundleLayout(listed);
  const checksumFieldCount = countTopLevelField(
    releaseSource,
    "bundleChecksum",
  );
  if (checksumFieldCount !== 1) {
    fail(
      `release.json must contain exactly one bundleChecksum field (found ${checksumFieldCount})`,
    );
  }
  const expected = release.bundleChecksum;
  release.bundleChecksum = ZERO_CHECKSUM;
  let normalized: string | undefined;
  try {
    normalized = canonicalize(release);
  } catch {
    return fail("release.json cannot be canonicalized");
  }
  if (normalized === undefined) {
    return fail("release.json cannot be canonicalized");
  }
  const actualBundleChecksum = `sha256:${createHash("sha256")
    .update(normalized)
    .update("\n")
    .update(checksums)
    .digest("hex")}`;
  if (actualBundleChecksum !== expected) fail("Bundle checksum mismatch");

  release.bundleChecksum = expected;
  return release;
}

export function verifyReleaseIntegrityForVersion(
  version: "2.0.0",
  root: string,
): PublicSiteReleaseManifest;
export function verifyReleaseIntegrityForVersion(
  version: "3.0.0",
  root: string,
): PublicSiteReleaseManifestV3;
export function verifyReleaseIntegrityForVersion(
  version: keyof ReleaseManifestByVersion,
  root: string,
): PublicSiteReleaseManifest | PublicSiteReleaseManifestV3 {
  const { release, source } = readReleaseManifest(root);
  return verifyReleaseIntegrityForParsedVersion(version, root, release, source);
}

function verifyReleaseIntegrityForParsedVersion(
  version: keyof ReleaseManifestByVersion,
  root: string,
  release: Record<string, unknown>,
  source: string,
): PublicSiteReleaseManifest | PublicSiteReleaseManifestV3 {
  if (release.contractVersion !== version) {
    throw new ContractError(
      "CONTRACT_INVALID",
      `Invalid release contract version for ${version}`,
      [{ path: "/contractVersion", message: `expected ${version}` }],
    );
  }

  verifyReleaseIntegrityWithManifest(root, release, source);
  if (version === "2.0.0") {
    return validateContractDocumentForVersion("2.0.0", "release", release);
  }
  if (version === "3.0.0") {
    return validateContractDocumentForVersion("3.0.0", "release", release);
  }

  const unhandledVersion: never = version;
  throw new Error(`Unhandled registered contract version: ${unhandledVersion}`);
}

export function verifySupportedReleaseIntegrity(
  root: string,
): SupportedReleaseManifest {
  const { release, source } = readReleaseManifest(root);
  const version = resolveSupportedContractVersion(
    release.contractVersion,
  ) as keyof ReleaseManifestByVersion;
  return verifyReleaseIntegrityForParsedVersion(
    version,
    root,
    release,
    source,
  ) as SupportedReleaseManifest;
}

export function verifyReleaseIntegrity(
  root: string,
): PublicSiteReleaseManifest {
  const { release, source } = readReleaseManifest(root);
  if (release.contractVersion !== "2.0.0") {
    throw new ContractError(
      "CONTRACT_UNSUPPORTED",
      `Legacy release verifier supports only contract 2.0.0: ${String(release.contractVersion)}`,
      [{ path: "/contractVersion", message: "expected 2.0.0" }],
    );
  }
  verifyReleaseIntegrityWithManifest(root, release, source);
  return validateContractDocumentForVersion("2.0.0", "release", release);
}
