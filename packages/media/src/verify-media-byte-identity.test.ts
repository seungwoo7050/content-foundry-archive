import { describe, expect, it } from "vitest";

import {
  type ImageMediaRecord,
  verifyMediaByteIdentity,
} from "./verify-media-byte-identity.js";

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

describe("verifyMediaByteIdentity", () => {
  it("accepts the canonical byte length and SHA-256", () => {
    const verified = verifyMediaByteIdentity(media, bytes, "/media/items/0");

    expect(verified.media).toBe(media);
    expect(verified.bytes).toEqual(bytes);
  });

  it("reports length and hash mismatches together", () => {
    expect(() =>
      verifyMediaByteIdentity(
        { ...media, bytes: 80, sha256: "0".repeat(64) },
        bytes,
        "/media/items/0",
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "INTEGRITY_FAILED",
        issues: [
          expect.objectContaining({ path: "/media/items/0/bytes" }),
          expect.objectContaining({ path: "/media/items/0/sha256" }),
        ],
      }),
    );
  });
});
