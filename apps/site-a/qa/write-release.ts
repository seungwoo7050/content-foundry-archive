import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { qaMediaAssets } from "./media-assets";
import { projectQaReleaseDocuments } from "./release-documents";
import { projectQaReleaseFiles } from "./release-files";
import type { QaReleaseVariant } from "./release-facts";

export function writeQaRelease(
  parent: string,
  targetName: string,
  variant: QaReleaseVariant,
): string {
  const canonicalParent = resolve(parent);
  const target = resolve(canonicalParent, targetName);
  if (target === canonicalParent || dirname(target) !== canonicalParent) {
    throw new Error(`QA release target must be a direct child: ${targetName}`);
  }
  let owned = false;
  try {
    mkdirSync(target);
    owned = true;
    const mediaBytes = new Map(
      qaMediaAssets.map(({ id, sourcePath }) => [
        id,
        readFileSync(new URL(sourcePath, import.meta.url)),
      ]),
    );
    const files = projectQaReleaseFiles(
      projectQaReleaseDocuments(variant),
      mediaBytes,
    );
    for (const [path, bytes] of files) {
      const output = resolve(target, path);
      mkdirSync(dirname(output), { recursive: true });
      writeFileSync(output, bytes, { flag: "wx" });
    }
    return target;
  } catch (error) {
    if (owned) rmSync(target, { recursive: true, force: true });
    throw error;
  }
}
