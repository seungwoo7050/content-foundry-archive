import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { afterEach, describe, expect, it } from "vitest";

import { writeRouteDispositionArtifact } from "./route-disposition-artifact-file";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadReleaseBundle(fixture);
const roots: string[] = [];

function artifactPath() {
  const root = mkdtempSync(join(tmpdir(), "route-disposition-artifact-"));
  roots.push(root);
  return join(root, ".site-build/route-dispositions.json");
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("route disposition artifact persistence", () => {
  it("atomically writes deterministic identity-bound JSON", async () => {
    const path = artifactPath();

    await writeRouteDispositionArtifact(path, bundle);
    const first = readFileSync(path, "utf8");
    await writeRouteDispositionArtifact(path, bundle);

    expect(readFileSync(path, "utf8")).toBe(first);
    expect(first.endsWith("\n")).toBe(true);
    expect(JSON.parse(first)).toMatchObject({
      schemaVersion: "1.0.0",
      release: { releaseId: "REL-2026-000042" },
      items: [],
    });
    expect(readdirSync(dirname(path))).toEqual(["route-dispositions.json"]);
  });

  it("removes temporary output when publication fails", async () => {
    const path = artifactPath();
    mkdirSync(path, { recursive: true });

    await expect(writeRouteDispositionArtifact(path, bundle)).rejects.toMatchObject({
      code: "BUILD_FAILED",
    });
    expect(readdirSync(dirname(path))).toEqual(["route-dispositions.json"]);
  });
});
