import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { exportImageSources } from "./export-image-sources.js";
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
      path: `objects/sha256/${sha256}.png`,
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

describe("exportImageSources", () => {
  it("exports canonical images and returns their manifest order", async () => {
    const root = mkdtempSync(join(tmpdir(), "media-export-all-"));
    roots.push(root);
    const sources = payloads.map(source);

    const assets = await exportImageSources(sources, root);

    expect(assets.map(({ mediaId }) => mediaId)).toEqual(["MED-000045", "MED-000046"]);
    for (const [index, asset] of assets.entries()) {
      expect(readFileSync(join(root, asset.relativePath))).toEqual(sources[index]!.bytes);
    }
  });

  it("deduplicates identical verified bytes by projected path", async () => {
    const root = mkdtempSync(join(tmpdir(), "media-export-all-"));
    roots.push(root);
    const first = source(payloads[0]);
    const assets = await exportImageSources(
      [first, { ...first, media: { ...first.media, id: "MED-DUPLICATE" } }],
      root,
    );

    expect(assets[1]!.relativePath).toBe(assets[0]!.relativePath);
    expect(readdirSync(join(root, "_media"))).toEqual([first.media.sha256]);
  });

  it("rejects different bytes projected to the same hash before writing", async () => {
    const root = mkdtempSync(join(tmpdir(), "media-export-all-"));
    roots.push(root);
    const first = source(payloads[0]);

    await expect(
      exportImageSources([first, { ...first, bytes: Buffer.from("different") }], root),
    ).rejects.toMatchObject({
      code: "BUILD_FAILED",
      issues: [{ path: "/media/items/1/sha256" }],
    });
    expect(existsSync(join(root, "_media"))).toBe(false);
  });

  it("does not write before every asset projection succeeds", async () => {
    const root = mkdtempSync(join(tmpdir(), "media-export-all-"));
    roots.push(root);
    const first = source(payloads[0]);
    const unsupported = {
      ...source(payloads[1]),
      media: { ...source(payloads[1]).media, mimeType: "image/svg+xml" },
      mimeType: "image/svg+xml",
    };

    await expect(exportImageSources([first, unsupported], root)).rejects.toMatchObject({
      code: "BUILD_FAILED",
      issues: [{ path: "/media/items/1/mimeType" }],
    });
    expect(existsSync(join(root, "_media"))).toBe(false);
  });
});
