import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { loadReleaseBundle } from "@content-foundry/content-contract";
import { afterEach, describe, expect, it, vi } from "vitest";

import { withRouteDispositionArtifact } from "./route-disposition-artifact-transaction";

const fixture = resolve(process.cwd(), "../../packages/content-contract/vendor/2.0.0/fixtures/bundles/valid/site-a-minimal");
const bundle = loadReleaseBundle(fixture);
const roots: string[] = [];

function artifactPath() {
  const root = mkdtempSync(join(tmpdir(), "disposition-transaction-"));
  roots.push(root);
  return join(root, ".site-build/route-dispositions.json");
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("route disposition artifact transaction", () => {
  it("publishes a new artifact before committing downstream work", async () => {
    const path = artifactPath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "prior bytes");
    const publish = vi.fn(async () => "published");

    await expect(
      withRouteDispositionArtifact(path, bundle, publish),
    ).resolves.toBe("published");
    expect(publish).toHaveBeenCalledOnce();
    expect(JSON.parse(readFileSync(path, "utf8"))).toMatchObject({
      release: { releaseId: "REL-2026-000042" },
    });
    expect(readdirSync(dirname(path))).toEqual(["route-dispositions.json"]);
  });

  it("restores exact prior bytes when downstream publication fails", async () => {
    const path = artifactPath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "prior bytes");

    await expect(
      withRouteDispositionArtifact(path, bundle, async () => {
        throw new Error("downstream failed");
      }),
    ).rejects.toThrow("downstream failed");
    expect(readFileSync(path, "utf8")).toBe("prior bytes");
    expect(readdirSync(dirname(path))).toEqual(["route-dispositions.json"]);
  });

  it("leaves no artifact when first publication fails downstream", async () => {
    const path = artifactPath();
    await expect(
      withRouteDispositionArtifact(path, bundle, async () => {
        throw new Error("downstream failed");
      }),
    ).rejects.toThrow("downstream failed");
    expect(existsSync(path)).toBe(false);
    expect(readdirSync(dirname(path))).toEqual([]);
  });

  it("rejects a linked build directory before moving external files", async () => {
    const path = artifactPath();
    const outside = join(dirname(dirname(path)), "outside");
    mkdirSync(outside);
    writeFileSync(join(outside, "route-dispositions.json"), "external");
    symlinkSync(outside, dirname(path), "dir");
    const publish = vi.fn(async () => undefined);

    await expect(withRouteDispositionArtifact(path, bundle, publish)).rejects.toMatchObject({ code: "BUILD_FAILED" });
    expect(publish).not.toHaveBeenCalled();
    expect(readFileSync(join(outside, "route-dispositions.json"), "utf8")).toBe(
      "external",
    );
  });
});
