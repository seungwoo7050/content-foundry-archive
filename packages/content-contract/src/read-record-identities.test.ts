import {
  cpSync,
  mkdtempSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

// Integrity has its own suite; these tests isolate identity after layout/schema pass.
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
  const root = mkdtempSync(join(tmpdir(), "content-foundry-record-id-"));
  cpSync(source, root, { recursive: true });
  temporaryRoots.push(root);
  return root;
}

function read(version: Version, root: string) {
  return version === "2.0.0"
    ? readReleaseBundleDocumentsForVersion("2.0.0", root)
    : readReleaseBundleDocumentsForVersion("3.0.0", root);
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true });
  }
});

describe("bundle record identities", () => {
  it.each<Version>(["2.0.0", "3.0.0"])(
    "binds contract %s document IDs to exact canonical filenames",
    (version) => {
      const root = copyFixture(version);
      renameSync(
        join(root, "articles", "ART-000123.json"),
        join(root, "articles", "ART-OTHER.json"),
      );
      renameSync(
        join(root, "pages", "about.json"),
        join(root, "pages", "other-page.json"),
      );

      expect(() => read(version, root)).toThrowError(
        expect.objectContaining({
          code: "REFERENCE_INVALID",
          issues: [
            {
              path: "/articles/ART-OTHER.json/id",
              message: "expected ART-OTHER, got ART-000123",
            },
            {
              path: "/pages/other-page.json/id",
              message: "expected other-page, got about",
            },
          ],
        }),
      );
    },
  );

  it("reports page schema errors before an earlier article identity mismatch", () => {
    const root = copyFixture("3.0.0");
    renameSync(
      join(root, "articles", "ART-000123.json"),
      join(root, "articles", "ART-OTHER.json"),
    );
    writeFileSync(
      join(root, "pages", "about.json"),
      '{"contractVersion":"3.0.0"}\n',
    );

    expect(() => read("3.0.0", root)).toThrowError(
      expect.objectContaining({ code: "CONTRACT_INVALID" }),
    );
  });
});
