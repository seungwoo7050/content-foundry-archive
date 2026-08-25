import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadSupportedReleaseBundle } from "@content-foundry/content-contract";
import { afterEach, describe, expect, it } from "vitest";

import { getGeneratedRoutes } from "../lib/generated-routes";
import { qaMediaAssets } from "./media-assets";
import { writeQaRelease } from "./write-release";

const roots: string[] = [];
const parent = () => {
  const root = mkdtempSync(join(tmpdir(), "public-sites-qa-release-"));
  roots.push(root);
  return root;
};
afterEach(() => roots.splice(0).forEach((root) => rmSync(root, { recursive: true })));
const variant = {
  theme: "editorial-utility",
  skin: "warm-neutral",
  origin: "https://editorial-warm-neutral.qa.public-sites.example",
} as const;

describe("writeQaRelease", () => {
  it("writes one release that round-trips through the actual v4 loader", () => {
    const target = writeQaRelease(parent(), "editorial-warm-neutral", variant);
    const bundle = loadSupportedReleaseBundle(target, {
      resolveV3ConsumerContext: () => ({ generatedRoutes: new Set(), nicheComponentRegistry: {} }),
      resolveV4ConsumerContext: (candidate) => ({
        generatedRoutes: getGeneratedRoutes(candidate),
        nicheComponentRegistry: {},
        presentationReadiness: { releaseMode: "preview", siteWideNoindex: true },
      }),
    });
    const diskRelease = JSON.parse(readFileSync(join(target, "release.json"), "utf8"));
    expect(bundle.release.contractVersion).toBe("4.0.0");
    expect(bundle.release.bundleChecksum).toBe(diskRelease.bundleChecksum);
    bundle.mediaManifest.items.forEach((media, index) =>
      expect(readFileSync(join(target, media.path))).toEqual(
        readFileSync(new URL(qaMediaAssets[index]!.sourcePath, import.meta.url)),
      ),
    );
  });

  it("rejects existing directory and symlink targets without removing them", () => {
    const root = parent();
    const existing = join(root, "existing");
    mkdirSync(existing);
    expect(() => writeQaRelease(root, "existing", variant)).toThrow();
    const link = join(root, "linked");
    symlinkSync(existing, link);
    expect(() => writeQaRelease(root, "linked", variant)).toThrow();
    expect(lstatSync(existing).isDirectory()).toBe(true);
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
  });
});
