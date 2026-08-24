import { mkdtempSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { writeStaticAssetFile } from "./write-static-asset-file.js";

const roots: string[] = [];
const recordPath = "/media/items/0";

function temporaryRoot(label: string) {
  const root = mkdtempSync(join(tmpdir(), label));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("writeStaticAssetFile", () => {
  it("rejects a relative path that escapes the output root", async () => {
    const root = temporaryRoot("static-writer-root-");
    const outside = temporaryRoot("static-writer-outside-");
    const escaping = relative(root, join(outside, "outside.bin"));

    await expect(
      writeStaticAssetFile(root, escaping, Buffer.from("bytes"), recordPath),
    ).rejects.toMatchObject({
      code: "BUILD_FAILED",
      issues: [{ path: recordPath, message: "output path is not a safe relative file" }],
    });
    expect(readdirSync(outside)).toEqual([]);
  });

  it("rejects a symlinked output directory without touching its target", async () => {
    const root = temporaryRoot("static-writer-root-");
    const outside = temporaryRoot("static-writer-outside-");
    symlinkSync(outside, join(root, "_media"));

    await expect(
      writeStaticAssetFile(
        root,
        "_media/hash/16w.webp",
        Buffer.from("bytes"),
        recordPath,
      ),
    ).rejects.toMatchObject({
      code: "BUILD_FAILED",
      issues: [{ path: recordPath, message: "output path is not a safe directory" }],
    });
    expect(readdirSync(outside)).toEqual([]);
  });
});
