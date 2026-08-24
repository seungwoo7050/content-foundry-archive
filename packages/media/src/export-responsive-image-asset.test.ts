import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";

import { exportResponsiveImageAsset } from "./export-responsive-image-asset.js";
import { generateResponsiveImageAsset } from "./generate-responsive-image-asset.js";
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

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("exportResponsiveImageAsset", () => {
  it("materializes the original fallback and generated WebP idempotently", async () => {
    const root = mkdtempSync(join(tmpdir(), "responsive-export-"));
    roots.push(root);
    const generated = await generateResponsiveImageAsset(source, recordPath);

    const first = await exportResponsiveImageAsset(generated, root, recordPath);
    const second = await exportResponsiveImageAsset(generated, root, recordPath);
    const derivative = generated.derivatives[0]!;

    expect(second).toEqual(first);
    expect(readFileSync(join(root, first.fallback.relativePath))).toEqual(bytes);
    expect(readFileSync(join(root, derivative.asset.relativePath))).toEqual(
      derivative.bytes,
    );
    await expect(
      sharp(readFileSync(join(root, derivative.asset.relativePath))).metadata(),
    ).resolves.toMatchObject({ format: "webp", width: 16, height: 9 });
  });
});
