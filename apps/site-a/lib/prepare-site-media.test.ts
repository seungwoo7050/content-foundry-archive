import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import {
  loadV3ReleaseBundle,
  type MediaManifest,
} from "@content-foundry/content-contract";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getGeneratedRoutes } from "./generated-routes";
import { prepareSiteMedia } from "./prepare-site-media";

const fixture = resolve(
  process.cwd(),
  "../../packages/content-contract/vendor/3.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadV3ReleaseBundle(fixture, {
  expectedSiteId: "site-a",
  resolveConsumerContext: (candidate) => ({
    generatedRoutes: getGeneratedRoutes(candidate),
    nicheComponentRegistry: { "site-a": [] },
  }),
});
const v2Manifest: MediaManifest = {
  items: [
    {
      ...bundle.mediaManifest.items[0]!,
      source: "bundle",
      path: "media/v2-source.png",
    },
  ],
};
const payloads = [
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO48+f5f0oww6gBowYAMQDDohr/igFCLQAAAABJRU5ErkJggg==",
].map((encoded) => Buffer.from(encoded, "base64"));
const roots: string[] = [];

function outputRoot() {
  const root = mkdtempSync(join(tmpdir(), "site-a-media-"));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

describe("prepareSiteMedia", () => {
  it("resolves and exports a v2 bundle media source", async () => {
    const releaseDirectory = outputRoot();
    const publicDirectory = outputRoot();
    const source = v2Manifest.items[0]!;
    mkdirSync(join(releaseDirectory, "media"));
    writeFileSync(join(releaseDirectory, source.path), payloads[0]!);
    const immutableObjectLoader = vi.fn(async () => null);

    const assets = await prepareSiteMedia(
      { mediaManifest: v2Manifest },
      { immutableObjectLoader, publicDirectory, releaseDirectory },
    );

    expect([...assets.keys()]).toEqual([source.id]);
    expect(immutableObjectLoader).not.toHaveBeenCalled();
    expect(readFileSync(join(publicDirectory, assets.get(source.id)!.fallback.relativePath)))
      .toEqual(payloads[0]);
  });

  it("resolves, verifies, transforms, exports, and indexes every v3 image", async () => {
    const objects = new Map(
      bundle.mediaManifest.items.map((item, index) => [item.path, payloads[index]!]),
    );
    const immutableObjectLoader = vi.fn(async (key: string) => objects.get(key) ?? null);
    const publicDirectory = outputRoot();

    const assets = await prepareSiteMedia(bundle, {
      immutableObjectLoader,
      publicDirectory,
      releaseDirectory: fixture,
    });

    expect([...assets.keys()]).toEqual(["MED-000045", "MED-000046"]);
    expect(immutableObjectLoader.mock.calls).toEqual(
      bundle.mediaManifest.items.map((item) => [item.path]),
    );
    const first = assets.get("MED-000045")!;
    expect(readFileSync(join(publicDirectory, first.fallback.relativePath))).toEqual(
      payloads[0],
    );
    expect(existsSync(join(publicDirectory, first.derivatives[0]!.relativePath))).toBe(
      true,
    );
  });

  it("writes no assets when any required immutable object is missing", async () => {
    const publicDirectory = outputRoot();

    await expect(
      prepareSiteMedia(bundle, {
        immutableObjectLoader: async (key) =>
          key === bundle.mediaManifest.items[0]!.path ? payloads[0]! : null,
        publicDirectory,
        releaseDirectory: fixture,
      }),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [{ path: "/media/items/1/path" }],
    });
    expect(existsSync(join(publicDirectory, "_media"))).toBe(false);
  });
});
