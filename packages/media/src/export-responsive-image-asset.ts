import { exportStaticImageSource } from "./export-static-image-source.js";
import { type GeneratedResponsiveImageAsset } from "./generate-responsive-image-asset.js";
import { type ResponsiveImageAsset } from "./project-responsive-image-asset.js";
import { writeStaticAssetFile } from "./write-static-asset-file.js";

export async function exportResponsiveImageAsset(
  generated: GeneratedResponsiveImageAsset,
  outputRoot: string,
  recordPath: string,
): Promise<ResponsiveImageAsset> {
  await exportStaticImageSource(generated.source, outputRoot, recordPath);
  for (const derivative of generated.derivatives) {
    await writeStaticAssetFile(
      outputRoot,
      derivative.asset.relativePath,
      derivative.bytes,
      recordPath,
    );
  }
  return generated.asset;
}
