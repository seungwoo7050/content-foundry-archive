import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { QA_QUALITY_VARIANTS } from "./variants";
import { writeQaRelease } from "./write-release";

export function writeQaReleaseMatrix(parent: string, targetName: string): string {
  const canonicalParent = resolve(parent);
  const target = resolve(canonicalParent, targetName);
  if (target === canonicalParent || dirname(target) !== canonicalParent) {
    throw new Error(`QA matrix target must be a direct child: ${targetName}`);
  }
  let owned = false;
  try {
    mkdirSync(target);
    owned = true;
    for (const variant of QA_QUALITY_VARIANTS) {
      writeQaRelease(target, variant.id, variant);
    }
    const manifest = {
      nonOperational: true,
      generatedAt: "2026-08-25T00:00:00Z",
      variants: QA_QUALITY_VARIANTS.map(({ id, theme, skin, origin }) => ({
        id, theme, skin, origin, releaseDirectory: id,
      })),
    };
    writeFileSync(join(target, "matrix.json"), `${JSON.stringify(manifest)}\n`, {
      flag: "wx",
    });
    return target;
  } catch (error) {
    if (owned) rmSync(target, { recursive: true, force: true });
    throw error;
  }
}
