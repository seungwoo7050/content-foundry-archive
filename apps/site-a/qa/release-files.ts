import { createHash } from "node:crypto";

import type { LoadedReleaseBundleV4 } from "@content-foundry/content-contract";
import { verifyMediaByteIdentity } from "@content-foundry/media";

const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const json = (value: unknown) => Buffer.from(`${JSON.stringify(value)}\n`);
const byUtf8 = (left: string, right: string) =>
  Buffer.compare(Buffer.from(left), Buffer.from(right));
const canonicalRelease = (release: Record<string, unknown>) =>
  JSON.stringify(Object.fromEntries(Object.entries(release).sort(([a], [b]) => byUtf8(a, b))));

export function projectQaReleaseFiles(
  documents: LoadedReleaseBundleV4,
  mediaBytes: ReadonlyMap<string, Buffer>,
): ReadonlyMap<string, Buffer> {
  const files = new Map<string, Buffer>();
  for (const [path, document] of Object.entries({
    "site.json": documents.site,
    "navigation.json": documents.navigation,
    "taxonomy.json": documents.taxonomy,
    "media/media-manifest.json": documents.mediaManifest,
    "presentation.json": documents.presentation,
    "redirects.json": documents.redirects,
  })) files.set(path, json(document));
  for (const [directory, records] of [
    ["articles", documents.articles],
    ["pages", documents.pages],
  ] as const) {
    for (const record of records) files.set(`${directory}/${record.id}.json`, json(record));
  }
  documents.mediaManifest.items.forEach((media, index) => {
    const bytes = mediaBytes.get(media.id);
    if (!bytes) throw new Error(`Missing QA media bytes: ${media.id}`);
    const verified = verifyMediaByteIdentity(media, bytes, `/media/items/${index}`);
    files.set(media.path, Buffer.from(verified.bytes));
  });
  const checksums = Buffer.from(
    `${[...files.keys()].sort(byUtf8).map((path) => `${hash(files.get(path)!)}  ${path}`).join("\n")}\n`,
  );
  const zeroRelease = { ...documents.release, bundleChecksum: `sha256:${"0".repeat(64)}` };
  const bundleChecksum = `sha256:${hash(
    Buffer.concat([Buffer.from(`${canonicalRelease(zeroRelease)}\n`), checksums]),
  )}`;
  files.set("checksums.txt", checksums);
  files.set("release.json", json({ ...documents.release, bundleChecksum }));
  return new Map([...files].sort(([left], [right]) => byUtf8(left, right)));
}
