import {
  projectStaticImageAsset,
  type StaticImageAsset,
} from "./project-static-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";
import { writeStaticAssetFile } from "./write-static-asset-file.js";

export async function exportStaticImageSource(
  source: VerifiedImageSource,
  outputRoot: string,
  recordPath: string,
): Promise<StaticImageAsset> {
  const asset = projectStaticImageAsset(source, recordPath);
  await writeStaticAssetFile(outputRoot, asset.relativePath, source.bytes, recordPath);
  return asset;
}
