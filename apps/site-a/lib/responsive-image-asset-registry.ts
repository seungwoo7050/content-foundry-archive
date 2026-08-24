import { isDeepStrictEqual } from "node:util";

import {
  ContractError,
  type ContractIssue,
  type LoadedSupportedReleaseBundle,
} from "@content-foundry/content-contract";
import {
  projectResponsiveImageAsset,
  type ResponsiveImageAsset,
} from "@content-foundry/media";

export type ResponsiveImageAssetRegistry = ReadonlyMap<
  string,
  ResponsiveImageAsset
>;

type SupportedMediaManifest = LoadedSupportedReleaseBundle["mediaManifest"];

export function createResponsiveImageAssetRegistry(
  manifest: SupportedMediaManifest,
  assets: Iterable<ResponsiveImageAsset>,
): ResponsiveImageAssetRegistry {
  const candidates = [...assets];
  const issues: ContractIssue[] = [];
  if (candidates.length !== manifest.items.length) {
    issues.push({
      path: "/media/items",
      message: `expected ${manifest.items.length} responsive assets, got ${candidates.length}`,
    });
  }

  manifest.items.forEach((media, index) => {
    const asset = candidates[index];
    if (asset === undefined) return;
    const expected = projectResponsiveImageAsset(
      {
        media,
        mimeType: media.mimeType,
        width: media.width,
        height: media.height,
      },
      `/media/items/${index}`,
    );
    const issueCount = issues.length;
    const fields = [
      ["id", asset.fallback.mediaId, media.id],
      ["sha256", asset.fallback.sha256, media.sha256],
      ["mimeType", asset.fallback.mimeType, media.mimeType],
      ["width", asset.fallback.width, media.width],
      ["height", asset.fallback.height, media.height],
      ["alt", asset.fallback.alt, media.alt],
      ["credit", asset.fallback.credit, media.credit],
      ["license", asset.fallback.license, media.license],
    ] as const;
    for (const [field, actual, manifestValue] of fields) {
      if (actual !== manifestValue) {
        issues.push({
          path: `/media/items/${index}/${field}`,
          message: `responsive asset does not match manifest ${field}`,
        });
      }
    }
    if (issues.length === issueCount && !isDeepStrictEqual(asset, expected)) {
      issues.push({
        path: `/media/items/${index}/projection`,
        message: "responsive asset does not match the deterministic manifest projection",
      });
    }
  });

  if (issues.length > 0) {
    throw new ContractError(
      "BUILD_FAILED",
      "Responsive image assets do not match the media manifest",
      issues,
    );
  }
  return new Map(candidates.map((asset) => [asset.fallback.mediaId, asset]));
}
