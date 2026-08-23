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

import { verifyReleaseIntegrity } from "./verify-integrity.js";

const fixture = new URL(
  "../vendor/2.0.0/fixtures/bundles/valid/site-a-minimal/",
  import.meta.url,
);
const temporaryRoots: string[] = [];

const copyFixture = () => {
  const root = mkdtempSync(join(tmpdir(), "content-foundry-bundle-"));
  cpSync(fixture, root, { recursive: true });
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
});
