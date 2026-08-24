import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { exportResponsiveImageSources } from "./export-responsive-image-sources.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

const roots: string[] = [];
const payloads = [
  [
    "MED-000045",
    "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7",
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  ],
  [
    "MED-000046",
    "6ece129d56e4d016fd870514dee9310d37dd4f504b6c145509f52b7ef315ca67",
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO48+f5f0oww6gBowYAMQDDohr/igFCLQAAAABJRU5ErkJggg==",
  ],
] as const;

function source([id, sha256, encoded]: (typeof payloads)[number]): VerifiedImageSource {
  const bytes = Buffer.from(encoded, "base64");
  return {
    media: {
      id,
      kind: "image",
      source: "immutable-object",
      path: `objects/${sha256}.png`,
      sha256,
      mimeType: "image/png",
      width: 16,
      height: 9,
      bytes: bytes.byteLength,
      alt: `${id} 설명`,
      credit: null,
      license: null,
    },
    bytes,
    mimeType: "image/png",
    width: 16,
    height: 9,
  };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("exportResponsiveImageSources", () => {
  it("exports canonical source and derivative sets in manifest order", async () => {
    const root = mkdtempSync(join(tmpdir(), "responsive-set-"));
    roots.push(root);
    const sources = payloads.map(source);

    const assets = await exportResponsiveImageSources(sources, root);

    expect(assets.map(({ fallback }) => fallback.mediaId)).toEqual([
      "MED-000045",
      "MED-000046",
    ]);
    for (const [index, asset] of assets.entries()) {
      expect(readFileSync(join(root, asset.fallback.relativePath))).toEqual(
        sources[index]!.bytes,
      );
      expect(existsSync(join(root, asset.derivatives[0]!.relativePath))).toBe(true);
    }
  });

  it("writes nothing when a later source cannot transform", async () => {
    const root = mkdtempSync(join(tmpdir(), "responsive-set-"));
    roots.push(root);
    const sources = payloads.map(source);
    sources[1] = { ...sources[1]!, bytes: Buffer.from("not an image") };

    await expect(exportResponsiveImageSources(sources, root)).rejects.toMatchObject({
      code: "BUILD_FAILED",
      issues: [{ path: "/media/items/1" }],
    });
    expect(existsSync(join(root, "_media"))).toBe(false);
  });
});
