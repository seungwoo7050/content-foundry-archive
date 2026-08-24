import { ContractError } from "@content-foundry/content-contract";

import { exportStaticImageSource } from "./export-static-image-source.js";
import {
  projectStaticImageAsset,
  type StaticImageAsset,
} from "./project-static-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

export async function exportImageSources(
  sources: readonly VerifiedImageSource[],
  outputRoot: string,
): Promise<readonly StaticImageAsset[]> {
  const assets = sources.map((source, index) =>
    projectStaticImageAsset(source, `/media/items/${index}`),
  );
  const firstByPath = new Map<string, number>();
  for (const [index, asset] of assets.entries()) {
    const first = firstByPath.get(asset.relativePath);
    if (first === undefined) {
      firstByPath.set(asset.relativePath, index);
    } else if (!sources[first]!.bytes.equals(sources[index]!.bytes)) {
      throw new ContractError("BUILD_FAILED", "Static image hash collision", [
        {
          path: `/media/items/${index}/sha256`,
          message: `conflicts with /media/items/${first}/sha256`,
        },
      ]);
    }
  }

  for (const index of firstByPath.values()) {
    await exportStaticImageSource(sources[index]!, outputRoot, `/media/items/${index}`);
  }
  return assets;
}
