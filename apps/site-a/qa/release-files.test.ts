import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { qaMediaAssets } from "./media-assets";
import { projectQaReleaseDocuments } from "./release-documents";
import { projectQaReleaseFiles } from "./release-files";

const documents = projectQaReleaseDocuments({
  theme: "editorial-utility",
  skin: "warm-neutral",
  origin: "https://editorial-warm-neutral.qa.public-sites.example",
});
const mediaBytes = new Map(
  qaMediaAssets.map(({ id, sourcePath }) => [
    id,
    readFileSync(new URL(sourcePath, import.meta.url)),
  ]),
);
const byUtf8 = (left: string, right: string) => Buffer.compare(Buffer.from(left), Buffer.from(right));
const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");

describe("QA release byte plan", () => {
  it("projects a sorted, checksummed canonical bundle path set", () => {
    const files = projectQaReleaseFiles(documents, mediaBytes);
    const expectedPaths = [
      ...documents.articles.map(({ id }) => `articles/${id}.json`),
      ...documents.pages.map(({ id }) => `pages/${id}.json`),
      ...documents.mediaManifest.items.map(({ path }) => path),
      "checksums.txt", "media/media-manifest.json", "navigation.json",
      "presentation.json", "redirects.json", "release.json", "site.json", "taxonomy.json",
    ].sort(byUtf8);
    expect([...files.keys()]).toEqual(expectedPaths);
    for (const [path, bytes] of files) {
      if (path.endsWith(".json")) expect(bytes.toString()).toMatch(/[^\r]\n$/u);
    }
    const checksums = files.get("checksums.txt")!;
    expect(checksums.toString()).toMatch(/[^\r]\n$/u);
    const lines = checksums.toString().trimEnd().split("\n");
    expect(lines.map((line) => line.slice(66))).toEqual(
      expectedPaths.filter((path) => path !== "checksums.txt" && path !== "release.json"),
    );
    for (const line of lines) {
      const [digest, path] = line.split("  ") as [string, string];
      expect(digest).toBe(hash(files.get(path)!));
    }
    const release = JSON.parse(files.get("release.json")!.toString());
    expect(release.bundleChecksum).toMatch(/^sha256:(?!0{64}$)[0-9a-f]{64}$/u);
  });

  it("fails closed for missing or mismatched media bytes", () => {
    const missing = new Map(mediaBytes);
    missing.delete(qaMediaAssets[0].id);
    expect(() => projectQaReleaseFiles(documents, missing)).toThrow(/Missing QA media bytes/u);
    const mismatched = new Map(mediaBytes);
    mismatched.set(qaMediaAssets[0].id, Buffer.alloc(qaMediaAssets[0].bytes));
    expect(() => projectQaReleaseFiles(documents, mismatched)).toThrow(/Media byte identity failed/u);
  });
});
