import { describe, expect, it, vi } from "vitest";

import { createImmutableObjectMediaSourceReader } from "./read-immutable-object-media-source.js";
import { type ImageMediaRecord } from "./verify-media-byte-identity.js";

const recordPath = "/media/items/0";
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

describe("immutable-object media source reader", () => {
  it("passes the exact manifest key to the injected loader", async () => {
    const bytes = Buffer.from("source bytes");
    const loadObject = vi.fn(async () => bytes);

    await expect(
      createImmutableObjectMediaSourceReader(loadObject)(media, recordPath),
    ).resolves.toBe(bytes);
    expect(loadObject).toHaveBeenCalledOnce();
    expect(loadObject).toHaveBeenCalledWith(media.path);
  });

  it("rejects another source kind without calling the loader", async () => {
    const loadObject = vi.fn(async () => Buffer.from("unused"));

    await expect(
      createImmutableObjectMediaSourceReader(loadObject)(
        { ...media, source: "bundle" },
        recordPath,
      ),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [{ path: `${recordPath}/source` }],
    });
    expect(loadObject).not.toHaveBeenCalled();
  });

  it("rejects a missing immutable object as an integrity failure", async () => {
    await expect(
      createImmutableObjectMediaSourceReader(async () => null)(media, recordPath),
    ).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [{ path: `${recordPath}/path`, message: "immutable object is unavailable" }],
      retryable: false,
    });
  });

  it("normalizes loader exceptions as retryable without leaking provider details", async () => {
    const secret = "https://token@private-object-store.example/source";
    const failure = createImmutableObjectMediaSourceReader(async () =>
      Promise.reject(new Error(secret)),
    )(media, recordPath);

    await expect(failure).rejects.toMatchObject({
      code: "TEMPORARY",
      issues: [{ path: `${recordPath}/path`, message: "immutable object loader failed" }],
      retryable: true,
    });
    await expect(failure).rejects.not.toThrow(secret);
  });
});
