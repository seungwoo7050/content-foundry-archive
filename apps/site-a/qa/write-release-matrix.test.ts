import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { QA_QUALITY_VARIANTS } from "./variants";
import { writeQaReleaseMatrix } from "./write-release-matrix";

const roots: string[] = [];
const parent = () => {
  const root = mkdtempSync(join(tmpdir(), "public-sites-qa-matrix-"));
  roots.push(root);
  return root;
};
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true })));

describe("writeQaReleaseMatrix", () => {
  it("writes the exact non-operational matrix and fifteen releases", () => {
    const target = writeQaReleaseMatrix(parent(), "quality-matrix");
    const manifest = JSON.parse(readFileSync(join(target, "matrix.json"), "utf8"));
    expect(manifest).toEqual({
      nonOperational: true,
      generatedAt: "2026-08-25T00:00:00Z",
      variants: QA_QUALITY_VARIANTS.map(({ id, theme, skin, origin }) => ({
        id, theme, skin, origin, releaseDirectory: id,
      })),
    });
    const directories = readdirSync(target, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map(({ name }) => name)
      .sort();
    expect(directories).toEqual(
      QA_QUALITY_VARIANTS.map(({ id }) => id).sort(),
    );
    for (const variant of QA_QUALITY_VARIANTS) {
      const root = join(target, variant.id);
      const release = JSON.parse(readFileSync(join(root, "release.json"), "utf8"));
      const site = JSON.parse(readFileSync(join(root, "site.json"), "utf8"));
      expect(release).toMatchObject({
        defaultTheme: variant.theme, defaultSkin: variant.skin,
        articleCount: 17, pageCount: 4,
      });
      expect(release.bundleChecksum).toMatch(/^sha256:(?!0{64}$)[0-9a-f]{64}$/u);
      expect(site).toMatchObject({
        defaultTheme: variant.theme,
        defaultSkin: variant.skin,
        origin: variant.origin,
      });
    }
  });

  it("rejects existing directory and symlink roots without removing them", () => {
    const root = parent();
    const existing = join(root, "existing");
    mkdirSync(existing);
    expect(() => writeQaReleaseMatrix(root, "existing")).toThrow();
    const link = join(root, "linked");
    symlinkSync(existing, link);
    expect(() => writeQaReleaseMatrix(root, "linked")).toThrow();
    expect(lstatSync(existing).isDirectory()).toBe(true);
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
  });
});
