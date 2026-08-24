import { exportResponsiveImageAsset } from "./export-responsive-image-asset.js";
import {
  generateResponsiveImageAsset,
  type GeneratedResponsiveImageAsset,
} from "./generate-responsive-image-asset.js";
import { type ResponsiveImageAsset } from "./project-responsive-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

export async function exportResponsiveImageSources(
  sources: readonly VerifiedImageSource[],
  outputRoot: string,
): Promise<readonly ResponsiveImageAsset[]> {
  const generated: GeneratedResponsiveImageAsset[] = [];
  for (const [index, source] of sources.entries()) {
    generated.push(
      await generateResponsiveImageAsset(source, `/media/items/${index}`),
    );
  }
  for (const [index, image] of generated.entries()) {
    await exportResponsiveImageAsset(image, outputRoot, `/media/items/${index}`);
  }
  return generated.map(({ asset }) => asset);
}
