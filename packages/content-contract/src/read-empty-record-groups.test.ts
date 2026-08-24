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

import {
  readReleaseBundleDocuments,
  readReleaseBundleDocumentsForVersion,
} from "./read-bundle-documents.js";

type Version = "2.0.0" | "3.0.0";
const temporaryRoots: string[] = [];

function copyFixture(version: Version) {
  const source = fileURLToPath(
    new URL(
      `../vendor/${version}/fixtures/bundles/valid/site-a-minimal/`,
      import.meta.url,
    ),
  );
  const root = mkdtempSync(join(tmpdir(), "content-foundry-record-groups-"));
  cpSync(source, root, { recursive: true });
  temporaryRoots.push(root);
  return root;
}

function setCounts(root: string, articleCount: number, pageCount: number) {
  const path = join(root, "release.json");
  const release = JSON.parse(readFileSync(path, "utf8")) as Record<
    string,
    unknown
  >;
  release.articleCount = articleCount;
  release.pageCount = pageCount;
  writeFileSync(path, `${JSON.stringify(release)}\n`);
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

describe("empty release record groups", () => {
  it.each<Version>(["2.0.0", "3.0.0"])(
    "reads absent zero-count directories for contract %s",
    (version) => {
      const root = copyFixture(version);
      rmSync(join(root, "articles"), { recursive: true });
      rmSync(join(root, "pages"), { recursive: true });
      setCounts(root, 0, 0);

      const bundle = read(version, root);

      expect(bundle.articles).toEqual([]);
      expect(bundle.pages).toEqual([]);
      if (version === "2.0.0") {
        expect(readReleaseBundleDocuments(root)).toEqual(bundle);
      }
    },
  );

  it.each<Version>(["2.0.0", "3.0.0"])(
    "reports every nonzero count with an absent directory for contract %s",
    (version) => {
      const root = copyFixture(version);
      rmSync(join(root, "articles"), { recursive: true });
      rmSync(join(root, "pages"), { recursive: true });
      const attempt = () => read(version, root);

      expect(attempt).toThrowError(
        expect.objectContaining({
          code: "REFERENCE_INVALID",
          issues: [
            { path: "/release/articleCount", message: "expected 0, got 1" },
            { path: "/release/pageCount", message: "expected 0, got 1" },
          ],
        }),
      );
      expect(attempt).not.toThrowError(/ENOENT|content-foundry-record-groups/);
    },
  );

  it("reports record schema failures before missing-directory references", () => {
    const root = copyFixture("3.0.0");
    rmSync(join(root, "articles"), { recursive: true });
    writeFileSync(
      join(root, "pages", "about.json"),
      '{"contractVersion":"3.0.0"}\n',
    );

    expect(() => read("3.0.0", root)).toThrowError(
      expect.objectContaining({ code: "CONTRACT_INVALID" }),
    );
  });
});
