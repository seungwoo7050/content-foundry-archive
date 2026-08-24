import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createFilesystemImmutableObjectLoader } from "./load-immutable-object-from-directory.js";

const roots: string[] = [];

function temporaryRoot(label: string) {
  const root = mkdtempSync(join(tmpdir(), label));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("createFilesystemImmutableObjectLoader", () => {
  it("reads a regular immutable object confined to its root", async () => {
    const root = temporaryRoot("immutable-media-");
    mkdirSync(join(root, "objects"));
    writeFileSync(join(root, "objects/source.png"), "verified bytes");

    await expect(
      createFilesystemImmutableObjectLoader(root)("objects/source.png"),
    ).resolves.toEqual(Buffer.from("verified bytes"));
  });

  it("returns missing for absent, escaping, directory, and external symlink keys", async () => {
    const root = temporaryRoot("immutable-media-");
    const outside = temporaryRoot("immutable-outside-");
    mkdirSync(join(root, "objects"));
    writeFileSync(join(outside, "source.png"), "outside bytes");
    symlinkSync(join(outside, "source.png"), join(root, "objects/link.png"));
    const loader = createFilesystemImmutableObjectLoader(root);

    await expect(loader("objects/missing.png")).resolves.toBeNull();
    await expect(loader("../source.png")).resolves.toBeNull();
    await expect(loader("objects")).resolves.toBeNull();
    await expect(loader("objects/link.png")).resolves.toBeNull();
  });

  it("preserves an unavailable root as an infrastructure error", async () => {
    const root = temporaryRoot("immutable-media-");
    rmSync(root, { recursive: true });

    await expect(
      createFilesystemImmutableObjectLoader(root)("objects/source.png"),
    ).rejects.toMatchObject({ code: "ENOENT" });
  });
});
