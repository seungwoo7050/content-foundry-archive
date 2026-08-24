import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

// Integrity behavior has its own suite; these tests isolate decoding after it passes.
vi.mock("./verify-integrity.js", async () => {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const readRelease = (root: string) =>
    JSON.parse(readFileSync(join(root, "release.json"), "utf8")) as unknown;
  return {
    verifyReleaseIntegrity: readRelease,
    verifyReleaseIntegrityForVersion: (_version: string, root: string) =>
      readRelease(root),
  };
});

import { readReleaseBundleDocumentsForVersion } from "./read-bundle-documents.js";

type Version = "2.0.0" | "3.0.0";
const temporaryRoots: string[] = [];

function copyFixture(version: Version) {
  const source = fileURLToPath(
    new URL(
      `../vendor/${version}/fixtures/bundles/valid/site-a-minimal/`,
      import.meta.url,
    ),
  );
  const root = mkdtempSync(join(tmpdir(), "content-foundry-json-utf8-"));
  cpSync(source, root, { recursive: true });
  temporaryRoots.push(root);
  return root;
}

function corruptFirstMultibyteCharacter(path: string) {
  const bytes = readFileSync(path);
  const index = bytes.findIndex((byte) => byte >= 0x80);
  expect(index).toBeGreaterThanOrEqual(0);
  bytes[index] = 0xff;
  writeFileSync(path, bytes);
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true });
  }
});

describe("bundle JSON UTF-8 decoding", () => {
  it.each([
    ["2.0.0" as const, "site.json"],
    ["3.0.0" as const, "site.json"],
    ["3.0.0" as const, "articles/ART-000123.json"],
  ])("rejects invalid bytes in contract %s payload %s", (version, path) => {
    const root = copyFixture(version);
    corruptFirstMultibyteCharacter(join(root, path));
    const attempt = () =>
      version === "2.0.0"
        ? readReleaseBundleDocumentsForVersion("2.0.0", root)
        : readReleaseBundleDocumentsForVersion("3.0.0", root);

    expect(attempt).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [
          { path: `/${path}`, message: "JSON document must be valid UTF-8" },
        ],
      }),
    );
    expect(attempt).toThrowError(`Cannot parse ${path}`);
    expect(attempt).not.toThrowError(/\ufffd|content-foundry-json-utf8/iu);
  });
});
