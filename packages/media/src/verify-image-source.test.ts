import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { type ImageMediaRecord } from "./verify-media-byte-identity.js";
import { verifyImageSource } from "./verify-image-source.js";

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

describe("verifyImageSource", () => {
  it("accepts the canonical PNG MIME type and dimensions", async () => {
    await expect(verifyImageSource(media, bytes, recordPath)).resolves.toMatchObject({
      media,
      bytes,
      mimeType: "image/png",
      width: 16,
      height: 9,
    });
  });

  it("aggregates MIME and dimension mismatches", async () => {
    await expect(
      verifyImageSource(
        { ...media, mimeType: "image/webp", width: 17, height: 10 },
        bytes,
        recordPath,
      ),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: ["mimeType", "width", "height"].map((field) =>
        expect.objectContaining({ path: `${recordPath}/${field}` }),
      ),
    });
  });

  it("rejects identity-valid bytes that cannot decode as an image", async () => {
    const garbage = Buffer.from("not an image");
    const invalid = {
      ...media,
      bytes: garbage.byteLength,
      sha256: createHash("sha256").update(garbage).digest("hex"),
    };

    await expect(
      verifyImageSource(invalid, garbage, recordPath),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [expect.objectContaining({ path: recordPath })],
    });
  });

  it("rejects identity-valid bytes with a corrupt pixel payload", async () => {
    const corrupt = Buffer.from(bytes);
    corrupt[52] = corrupt[52]! ^ 0xff;
    const invalid = {
      ...media,
      sha256: createHash("sha256").update(corrupt).digest("hex"),
    };

    await expect(
      verifyImageSource(invalid, corrupt, recordPath),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [expect.objectContaining({ path: recordPath })],
    });
  });
});
