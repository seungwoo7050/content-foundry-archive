import {
  ContractError,
  type ContractIssue,
  type MediaManifestV3,
} from "@content-foundry/content-contract";
import type { ResponsiveImageAsset } from "@content-foundry/media";

export type ResponsiveImageAssetRegistry = ReadonlyMap<
  string,
  ResponsiveImageAsset
>;

export function createResponsiveImageAssetRegistry(
  manifest: MediaManifestV3,
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
    for (const [field, actual, expected] of fields) {
      if (actual !== expected) {
        issues.push({
          path: `/media/items/${index}/${field}`,
          message: `responsive asset does not match manifest ${field}`,
        });
      }
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
