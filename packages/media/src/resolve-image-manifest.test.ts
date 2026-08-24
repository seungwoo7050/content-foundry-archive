import { type MediaManifestV3 } from "@content-foundry/content-contract";
import { describe, expect, it, vi } from "vitest";

import { createImmutableObjectMediaSourceReader } from "./read-immutable-object-media-source.js";
import { resolveImageManifest } from "./resolve-image-manifest.js";

const firstBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  "base64",
);
const secondBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO48+f5f0oww6gBowYAMQDDohr/igFCLQAAAABJRU5ErkJggg==",
  "base64",
);
const manifest: MediaManifestV3 = {
  items: [
    {
      id: "MED-000045",
      kind: "image",
      source: "immutable-object",
      path: "objects/sha256/216154d9.png",
      sha256: "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7",
      mimeType: "image/png",
      width: 16,
      height: 9,
      bytes: 79,
      alt: "파란색으로 표시된 발급 화면 순서 1단계",
      credit: null,
      license: null,
    },
    {
      id: "MED-000046",
      kind: "image",
      source: "immutable-object",
      path: "objects/sha256/6ece129d.png",
      sha256: "6ece129d56e4d016fd870514dee9310d37dd4f504b6c145509f52b7ef315ca67",
      mimeType: "image/png",
      width: 16,
      height: 9,
      bytes: 79,
      alt: "초록색으로 표시된 발급 화면 순서 2단계",
      credit: null,
      license: null,
    },
  ],
};

function readersWith(loadObject: (key: string) => Promise<Uint8Array | null>) {
  return {
    bundle: vi.fn(async () => Promise.reject(new Error("unexpected bundle read"))),
    "immutable-object": createImmutableObjectMediaSourceReader(loadObject),
  };
}

describe("resolveImageManifest", () => {
  it("resolves canonical images in manifest order", async () => {
    const objects = new Map([
      [manifest.items[0]!.path, firstBytes],
      [manifest.items[1]!.path, secondBytes],
    ]);
    const loadObject = vi.fn(async (key: string) => objects.get(key) ?? null);

    const verified = await resolveImageManifest(manifest, readersWith(loadObject));

    expect(verified.map(({ media }) => media.id)).toEqual(["MED-000045", "MED-000046"]);
    expect(loadObject.mock.calls).toEqual([
      [manifest.items[0]!.path],
      [manifest.items[1]!.path],
    ]);
  });

  it("reports a later missing object at its manifest index", async () => {
    const loadObject = vi.fn(async (key: string) =>
      key === manifest.items[0]!.path ? firstBytes : null,
    );

    await expect(
      resolveImageManifest(manifest, readersWith(loadObject)),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [{ path: "/media/items/1/path" }],
    });
    expect(loadObject).toHaveBeenCalledTimes(2);
  });
});
