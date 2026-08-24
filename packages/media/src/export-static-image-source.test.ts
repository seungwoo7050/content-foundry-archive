import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { exportStaticImageSource } from "./export-static-image-source.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

const roots: string[] = [];
const bytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAFklEQVR42mO4/erff0oww6gBowYAMQBJjx0/o2g2tAAAAABJRU5ErkJggg==",
  "base64",
);
const source: VerifiedImageSource = {
  media: {
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
  bytes,
  mimeType: "image/png",
  width: 16,
  height: 9,
};
const recordPath = "/media/items/0";

function temporaryRoot(label: string) {
  const root = mkdtempSync(join(tmpdir(), label));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("exportStaticImageSource", () => {
  it("writes exact bytes and accepts an identical repeat", async () => {
    const root = temporaryRoot("media-export-");
    const first = await exportStaticImageSource(source, root, recordPath);
    const second = await exportStaticImageSource(source, root, recordPath);

    expect(second).toEqual(first);
    expect(readFileSync(join(root, first.relativePath))).toEqual(bytes);
  });

  it.each(["different file", "symlink"])("rejects an existing %s", async (kind) => {
    const root = temporaryRoot("media-export-");
    const asset = await exportStaticImageSource(source, root, recordPath);
    const target = join(root, asset.relativePath);
    let outside: string | undefined;
    rmSync(target);
    if (kind === "symlink") {
      outside = join(temporaryRoot("media-outside-"), "outside.png");
      writeFileSync(outside, "outside");
      symlinkSync(outside, target);
    } else {
      writeFileSync(target, "different");
    }

    await expect(
      exportStaticImageSource(source, root, recordPath),
    ).rejects.toMatchObject({
      code: "BUILD_FAILED",
      issues: [expect.objectContaining({ path: recordPath })],
    });
    if (outside) expect(readFileSync(outside, "utf8")).toBe("outside");
  });
});
