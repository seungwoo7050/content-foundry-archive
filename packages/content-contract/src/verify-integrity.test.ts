import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  verifyReleaseIntegrity,
  verifyReleaseIntegrityForVersion,
} from "./verify-integrity.js";

const fixture = new URL(
  "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
  import.meta.url,
);
const v3Fixture = new URL(
  "../vendor/3.0.0/fixtures/bundles/valid/site-a-minimal/",
  import.meta.url,
);
const temporaryRoots: string[] = [];

const copyFixture = (source = fixture) => {
  const root = mkdtempSync(join(tmpdir(), "content-foundry-bundle-"));
  cpSync(source, root, { recursive: true });
  temporaryRoots.push(root);
  return root;
};

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true });
  }
});

describe("verifyReleaseIntegrity", () => {
  it("accepts the reference bundle", () => {
    const release = verifyReleaseIntegrity(copyFixture());
    expect(release.releaseId).toBe("REL-2026-000042");
  });

  it("detects a modified article", () => {
    const root = copyFixture();
    const article = join(root, "articles", "ART-000123.json");
    writeFileSync(article, readFileSync(article, "utf8").replace("발급 방법", "변조"));
    expect(() => verifyReleaseIntegrity(root)).toThrowError(
      expect.objectContaining({ code: "INTEGRITY_FAILED" }),
    );
  });

  it("accepts canonical v3 integrity through the internal version boundary", () => {
    const release = verifyReleaseIntegrityForVersion(
      "3.0.0",
      copyFixture(v3Fixture),
    );
    expect(release.contractVersion).toBe("3.0.0");
    expect(release.releaseId).toBe("REL-2026-000043");
  });

  it("detects a modified v3 article through the internal version boundary", () => {
    const root = copyFixture(v3Fixture);
    const article = join(root, "articles", "ART-000123.json");
    writeFileSync(article, readFileSync(article, "utf8").replace("발급 화면", "변조"));
    expect(() =>
      verifyReleaseIntegrityForVersion("3.0.0", root),
    ).toThrowError(expect.objectContaining({ code: "INTEGRITY_FAILED" }));
  });

  it("rejects an internal version mismatch before integrity validation", () => {
    const root = copyFixture();
    const article = join(root, "articles", "ART-000123.json");
    writeFileSync(article, readFileSync(article, "utf8").replace("발급 방법", "변조"));
    expect(() =>
      verifyReleaseIntegrityForVersion("3.0.0", root),
    ).toThrowError(
      expect.objectContaining({
        code: "CONTRACT_INVALID",
        issues: [expect.objectContaining({ path: "/contractVersion" })],
      }),
    );
  });

  it("detects an unlisted file", () => {
    const root = copyFixture();
    writeFileSync(join(root, "unexpected.json"), "{}\n");
    expect(() => verifyReleaseIntegrity(root)).toThrowError(
      expect.objectContaining({ code: "INTEGRITY_FAILED" }),
    );
  });

  it("classifies a missing checksum manifest as an integrity failure", () => {
    const root = copyFixture();
    rmSync(join(root, "checksums.txt"));
    expect(() => verifyReleaseIntegrity(root)).toThrowError(
      expect.objectContaining({ code: "INTEGRITY_FAILED" }),
    );
  });

  it("rejects an unsupported version before checksum validation", () => {
    const root = copyFixture();
    const manifest = join(root, "release.json");
    const release = JSON.parse(readFileSync(manifest, "utf8")) as Record<string, unknown>;
    release.contractVersion = "3.0.0";
    writeFileSync(manifest, `${JSON.stringify(release, null, 2)}\n`);
    expect(() => verifyReleaseIntegrity(root)).toThrowError(
      expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }),
    );
  });

  it("keeps the canonical v3 bundle unsupported before activation", () => {
    expect(() => verifyReleaseIntegrity(copyFixture(v3Fixture))).toThrowError(
      expect.objectContaining({ code: "CONTRACT_UNSUPPORTED" }),
    );
  });
});
