import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { loadV3ReleaseBundle } from "@content-foundry/content-contract";
import { projectResponsiveImageAsset } from "@content-foundry/media";
import { afterEach, describe, expect, it } from "vitest";

import { getGeneratedRoutes } from "./generated-routes";
import {
  readSiteMediaProjection,
  writeSiteMediaProjection,
} from "./site-media-projection";

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
const assets = bundle.mediaManifest.items.map((media, index) =>
  projectResponsiveImageAsset(
    { media, mimeType: media.mimeType, width: media.width, height: media.height },
    `/media/items/${index}`,
  ),
);
const roots: string[] = [];

function projectionPath() {
  const root = mkdtempSync(join(tmpdir(), "site-media-projection-"));
  roots.push(root);
  return join(root, ".site-build/media-projection.json");
}

function document(path: string) {
  return JSON.parse(readFileSync(path, "utf8")) as {
    releaseId: string;
    assets: Array<{ derivatives: Array<{ publicPath: string }> }>;
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("site media projection persistence", () => {
  it("writes deterministic version-bound JSON and reads verified assets", async () => {
    const path = projectionPath();

    await writeSiteMediaProjection(path, bundle, assets);
    const first = readFileSync(path, "utf8");
    await writeSiteMediaProjection(path, bundle, assets);

    expect(readFileSync(path, "utf8")).toBe(first);
    expect(first.endsWith("\n")).toBe(true);
    expect(document(path)).toMatchObject({
      releaseId: bundle.release.releaseId,
      assets,
    });
    expect(readSiteMediaProjection(path, bundle)).toEqual(assets);
    expect(readdirSync(dirname(path))).toEqual(["media-projection.json"]);
  });

  it("rejects projection identity from another release", async () => {
    const path = projectionPath();
    await writeSiteMediaProjection(path, bundle, assets);
    const changed = document(path);
    changed.releaseId = "REL-OTHER";
    writeFileSync(path, `${JSON.stringify(changed)}\n`);

    expect(() => readSiteMediaProjection(path, bundle)).toThrowError(
      expect.objectContaining({
        code: "BUILD_FAILED",
        issues: [expect.objectContaining({ path: "/mediaProjection/releaseId" })],
      }),
    );
  });

  it("rejects a poisoned derivative after decoding", async () => {
    const path = projectionPath();
    await writeSiteMediaProjection(path, bundle, assets);
    const changed = document(path);
    changed.assets[0]!.derivatives[0]!.publicPath = "/_media/poisoned.webp";
    writeFileSync(path, `${JSON.stringify(changed)}\n`);

    expect(() => readSiteMediaProjection(path, bundle)).toThrowError(
      expect.objectContaining({
        code: "BUILD_FAILED",
        issues: [expect.objectContaining({ path: "/media/items/0/projection" })],
      }),
    );
  });

  it.each([
    ["invalid UTF-8", Buffer.from([0xc3, 0x28])],
    ["invalid JSON", Buffer.from("{")],
  ])("rejects %s projection bytes", async (_label, bytes) => {
    const path = projectionPath();
    await writeSiteMediaProjection(path, bundle, assets);
    writeFileSync(path, bytes);

    expect(() => readSiteMediaProjection(path, bundle)).toThrowError(
      expect.objectContaining({ code: "BUILD_FAILED" }),
    );
  });
});
