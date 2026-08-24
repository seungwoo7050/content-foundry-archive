import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createBundleMediaSourceReader } from "./read-bundle-media-source.js";
import { type ImageMediaRecord } from "./verify-media-byte-identity.js";

const roots: string[] = [];
const recordPath = "/media/items/0";
const media: ImageMediaRecord = {
  id: "MED-000045",
  kind: "image",
  source: "bundle",
  path: "media/MED-000045.png",
  sha256: "216154d9fcffafb56f3bd8d846eebdb9ae1b5dc8aaeeea88ce621d1ceb5798e7",
  mimeType: "image/png",
  width: 16,
  height: 9,
  bytes: 79,
  alt: "발급 화면 순서 1단계",
  credit: null,
  license: null,
};

function temporaryRoot(label: string) {
  const root = mkdtempSync(join(tmpdir(), label));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("bundle media source reader", () => {
  it("reads a regular file confined to the release root", async () => {
    const root = temporaryRoot("media-bundle-");
    mkdirSync(join(root, "media"));
    writeFileSync(join(root, media.path), "source bytes");

    await expect(createBundleMediaSourceReader(root)(media, recordPath)).resolves.toEqual(
      Buffer.from("source bytes"),
    );
  });

  it.each([
    [
      { ...media, source: "immutable-object" as const },
      "source",
      "expected bundle source",
    ],
    [{ ...media, path: "../outside.png" }, "path", "path escapes the release root"],
    [{ ...media, path: "media/missing.png" }, "path", "bundle source is unavailable"],
  ])("rejects an invalid source boundary", async (candidate, field, message) => {
    const root = temporaryRoot("media-bundle-");
    await expect(createBundleMediaSourceReader(root)(candidate, recordPath)).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [{ path: `${recordPath}/${field}`, message: expect.stringContaining(message) }],
    });
  });

  it("rejects a symlink whose target is outside the release root", async () => {
    const root = temporaryRoot("media-bundle-");
    const outside = temporaryRoot("media-outside-");
    mkdirSync(join(root, "media"));
    writeFileSync(join(outside, "source.png"), "source bytes");
    symlinkSync(join(outside, "source.png"), join(root, media.path));

    await expect(createBundleMediaSourceReader(root)(media, recordPath)).rejects.toMatchObject({
      code: "INTEGRITY_FAILED",
      issues: [{ path: `${recordPath}/path`, message: "path escapes the release root" }],
    });
  });
});
