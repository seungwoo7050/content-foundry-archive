import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { loadV3ReleaseBundle } from "@content-foundry/content-contract";
import { afterEach, describe, expect, it, vi } from "vitest";

const restoreFailure = vi.hoisted(() => ({ enabled: false }));

vi.mock("node:fs/promises", async (importOriginal) => {
  const filesystem = await importOriginal<typeof import("node:fs/promises")>();
  return {
    ...filesystem,
    rename: async (source: string, destination: string) => {
      if (restoreFailure.enabled && source.endsWith("previous-media")) {
        throw new Error("simulated restore failure");
      }
      return filesystem.rename(source, destination);
    },
  };
});

import { getGeneratedRoutes } from "./generated-routes";
import {
  clearGeneratedSiteBuildArtifacts,
  prepareV3SiteBuildArtifacts,
  type SiteBuildArtifactPaths,
} from "./prepare-site-build";
import { readSiteMediaProjection } from "./site-media-projection";

const fixture = join(
  process.cwd(),
  "../../packages/content-contract/vendor/3.0.0/fixtures/bundles/valid/site-a-minimal",
);
const bundle = loadV3ReleaseBundle(fixture, {
  resolveConsumerContext: (candidate) => ({
    generatedRoutes: getGeneratedRoutes(candidate),
    nicheComponentRegistry: { "site-a": [] },
  }),
});
const payloads = [
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO48+f5f0oww6gBowYAMQDDohr/igFCLQAAAABJRU5ErkJggg==",
].map((encoded) => Buffer.from(encoded, "base64"));
const roots: string[] = [];

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "site-build-artifacts-"));
  roots.push(root);
  const paths: SiteBuildArtifactPaths = {
    dispositionPath: join(root, ".site-build/route-dispositions.json"),
    projectionPath: join(root, ".site-build/media-projection.json"),
    publicDirectory: join(root, "public"),
  };
  return { root, paths, objects: join(root, "immutable") };
}

function writeObjects(root: string, count = payloads.length) {
  bundle.mediaManifest.items.slice(0, count).forEach((media, index) => {
    const path = join(root, media.path);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, payloads[index]!);
  });
}

function prepareOptions(
  paths: SiteBuildArtifactPaths,
  immutableObjectDirectory: string,
) {
  return {
    ...paths,
    immutableObjectDirectory,
    releaseDirectory: fixture,
  };
}

afterEach(() => {
  restoreFailure.enabled = false;
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("prepare site build artifacts", () => {
  it("publishes complete v3 media before its verified ready projection", async () => {
    const { root, paths, objects } = workspace();
    writeObjects(objects);

    const assets = await prepareV3SiteBuildArtifacts(
      bundle,
      prepareOptions(paths, objects),
    );

    expect(assets.map(({ fallback }) => fallback.mediaId)).toEqual([
      "MED-000045",
      "MED-000046",
    ]);
    expect(readFileSync(join(paths.publicDirectory, assets[0]!.fallback.relativePath)))
      .toEqual(payloads[0]);
    expect(
      existsSync(join(paths.publicDirectory, assets[1]!.derivatives[0]!.relativePath)),
    ).toBe(true);
    expect(readSiteMediaProjection(paths.projectionPath, bundle)).toEqual(assets);
    expect(readdirSync(join(root, ".site-build"))).toEqual([
      "media-projection.json",
    ]);
  });

  it("preserves prior artifacts when required source resolution fails", async () => {
    const { paths, objects } = workspace();
    writeObjects(objects, 1);
    const oldMedia = join(paths.publicDirectory, "_media/old.txt");
    mkdirSync(dirname(oldMedia), { recursive: true });
    writeFileSync(oldMedia, "old media");
    mkdirSync(dirname(paths.projectionPath), { recursive: true });
    writeFileSync(paths.projectionPath, "old projection");

    await expect(
      prepareV3SiteBuildArtifacts(bundle, prepareOptions(paths, objects)),
    ).rejects.toMatchObject({ code: "INTEGRITY_FAILED" });
    expect(readFileSync(oldMedia, "utf8")).toBe("old media");
    expect(readFileSync(paths.projectionPath, "utf8")).toBe("old projection");
  });

  it("restores prior media when the ready projection cannot publish", async () => {
    const { paths, objects } = workspace();
    writeObjects(objects);
    const oldMedia = join(paths.publicDirectory, "_media/old.txt");
    mkdirSync(dirname(oldMedia), { recursive: true });
    writeFileSync(oldMedia, "old media");
    mkdirSync(paths.projectionPath, { recursive: true });
    writeFileSync(join(paths.projectionPath, "block"), "directory target");

    await expect(
      prepareV3SiteBuildArtifacts(bundle, prepareOptions(paths, objects)),
    ).rejects.toMatchObject({ code: "BUILD_FAILED" });
    expect(readFileSync(oldMedia, "utf8")).toBe("old media");
  });

  it("preserves prior media in staging when restoration fails", async () => {
    const { root, paths, objects } = workspace();
    writeObjects(objects);
    const oldMedia = join(paths.publicDirectory, "_media/old.txt");
    mkdirSync(dirname(oldMedia), { recursive: true });
    writeFileSync(oldMedia, "old media");
    mkdirSync(paths.projectionPath, { recursive: true });
    restoreFailure.enabled = true;

    await expect(
      prepareV3SiteBuildArtifacts(bundle, prepareOptions(paths, objects)),
    ).rejects.toThrow("previous media remains at");
    const stage = readdirSync(join(root, ".site-build")).find((entry) =>
      entry.startsWith("media-stage-"),
    );
    expect(stage).toBeDefined();
    expect(
      readFileSync(join(root, ".site-build", stage!, "previous-media/old.txt"), "utf8"),
    ).toBe("old media");
  });

  it("clears only generated v2 media and projection artifacts", async () => {
    const { root, paths } = workspace();
    const generated = join(paths.publicDirectory, "_media/generated.webp");
    mkdirSync(dirname(generated), { recursive: true });
    mkdirSync(dirname(paths.projectionPath), { recursive: true });
    writeFileSync(generated, "generated");
    writeFileSync(join(paths.publicDirectory, "og.png"), "owned");
    writeFileSync(paths.projectionPath, "generated projection");
    writeFileSync(join(root, ".site-build/keep.txt"), "owned");

    await clearGeneratedSiteBuildArtifacts(paths);

    expect(existsSync(join(paths.publicDirectory, "_media"))).toBe(false);
    expect(existsSync(paths.projectionPath)).toBe(false);
    expect(readFileSync(join(paths.publicDirectory, "og.png"), "utf8")).toBe("owned");
    expect(readFileSync(join(root, ".site-build/keep.txt"), "utf8")).toBe("owned");
  });

  it("rejects a linked public output before clearing external media", async () => {
    const { root, paths } = workspace();
    const outside = join(root, "outside-public");
    const outsideMedia = join(outside, "_media/keep.txt");
    mkdirSync(dirname(outsideMedia), { recursive: true });
    writeFileSync(outsideMedia, "external media");
    symlinkSync(outside, paths.publicDirectory, "dir");

    await expect(clearGeneratedSiteBuildArtifacts(paths)).rejects.toMatchObject({
      code: "BUILD_FAILED",
    });
    expect(readFileSync(outsideMedia, "utf8")).toBe("external media");
  });

  it("rejects a linked build path before clearing an external projection", async () => {
    const { root, paths } = workspace();
    const outside = join(root, "outside-build");
    const outsideProjection = join(outside, "media-projection.json");
    mkdirSync(outside, { recursive: true });
    mkdirSync(paths.publicDirectory, { recursive: true });
    writeFileSync(outsideProjection, "external projection");
    symlinkSync(outside, dirname(paths.projectionPath), "dir");

    await expect(clearGeneratedSiteBuildArtifacts(paths)).rejects.toMatchObject({
      code: "BUILD_FAILED",
    });
    expect(readFileSync(outsideProjection, "utf8")).toBe("external projection");
  });
});
