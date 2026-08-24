import { describe, expect, it, vi } from "vitest";

import {
  type MediaSourceReaders,
  resolveImageSource,
} from "./resolve-image-source.js";
import { type ImageMediaRecord } from "./verify-media-byte-identity.js";

const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  "base64",
);
const media: ImageMediaRecord = {
  id: "MED-000045",
  kind: "image",
  source: "immutable-object",
  path: "objects/sha256/216154d9.png",
  sha256: "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7",
  mimeType: "image/png",
  width: 16,
  height: 9,
  bytes: 79,
  alt: "발급 화면 순서 1단계",
  credit: null,
  license: null,
};
const recordPath = "/media/items/0";

function readersFor(source: ImageMediaRecord["source"]) {
  const readers: MediaSourceReaders = {
    bundle: vi.fn(async () => bytes),
    "immutable-object": vi.fn(async () => bytes),
  };
  return {
    readers,
    selected: readers[source],
    unselected: readers[source === "bundle" ? "immutable-object" : "bundle"],
  };
}

describe("resolveImageSource", () => {
  it.each(["bundle", "immutable-object"] as const)(
    "selects and verifies the %s reader",
    async (source) => {
      const candidate = { ...media, source };
      const { readers, selected, unselected } = readersFor(source);

      await expect(
        resolveImageSource(candidate, readers, recordPath),
      ).resolves.toMatchObject({ media: candidate, bytes, width: 16, height: 9 });
      expect(selected).toHaveBeenCalledWith(candidate, recordPath);
      expect(unselected).not.toHaveBeenCalled();
    },
  );

  it("rejects changed bytes returned by the selected reader", async () => {
    const changed = Buffer.from(bytes);
    changed[52] = changed[52]! ^ 0xff;
    const readers: MediaSourceReaders = {
      bundle: vi.fn(async () => bytes),
      "immutable-object": vi.fn(async () => changed),
    };

    await expect(
      resolveImageSource(media, readers, recordPath),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [expect.objectContaining({ path: `${recordPath}/sha256` })],
    });
  });
});
