import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { generateResponsiveImageAsset } from "./generate-responsive-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  "base64",
);
const source: VerifiedImageSource = {
  media: {
    id: "MED-000045",
    kind: "image",
    source: "immutable-object",
    path: "objects/source.png",
    sha256: "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7",
    mimeType: "image/png",
    width: 16,
    height: 9,
    bytes: 79,
    alt: "발급 단계",
    credit: null,
    license: null,
  },
  bytes,
  mimeType: "image/png",
  width: 16,
  height: 9,
};
const recordPath = "/media/items/0";

describe("generateResponsiveImageAsset", () => {
  it("generates deterministic WebP bytes with projected dimensions", async () => {
    const first = await generateResponsiveImageAsset(source, recordPath);
    const second = await generateResponsiveImageAsset(source, recordPath);
    const derivative = first.derivatives[0]!;

    await expect(sharp(derivative.bytes).metadata()).resolves.toMatchObject({
      format: "webp",
      width: 16,
      height: 9,
    });
    expect(derivative.asset).toEqual(first.asset.derivatives[0]);
    expect(second.derivatives[0]!.bytes).toEqual(derivative.bytes);
  });

  it("normalizes an unexpected transform failure", async () => {
    await expect(
      generateResponsiveImageAsset(
        { ...source, bytes: Buffer.from("not an image") },
        recordPath,
      ),
    ).rejects.toMatchObject({
      code: "BUILD_FAILED",
      issues: [{ path: recordPath }],
      retryable: false,
    });
  });
});
