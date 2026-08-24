import { ContractError } from "@content-foundry/content-contract";
import sharp from "sharp";

import {
  projectResponsiveImageAsset,
  RESPONSIVE_WEBP_QUALITY,
  type ResponsiveImageAsset,
  type ResponsiveImageDerivative,
} from "./project-responsive-image-asset.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

export interface GeneratedResponsiveImageDerivative {
  readonly asset: ResponsiveImageDerivative;
  readonly bytes: Buffer;
}

export interface GeneratedResponsiveImageAsset {
  readonly source: VerifiedImageSource;
  readonly asset: ResponsiveImageAsset;
  readonly derivatives: readonly GeneratedResponsiveImageDerivative[];
}

export async function generateResponsiveImageAsset(
  source: VerifiedImageSource,
  recordPath: string,
): Promise<GeneratedResponsiveImageAsset> {
  const asset = projectResponsiveImageAsset(source, recordPath);
  try {
    const derivatives = await Promise.all(
      asset.derivatives.map(async (derivative) => {
        const { data, info } = await sharp(source.bytes)
          .resize({ width: derivative.width, withoutEnlargement: true })
          .webp({ quality: RESPONSIVE_WEBP_QUALITY })
          .toBuffer({ resolveWithObject: true });
        if (
          info.format !== "webp" ||
          info.width !== derivative.width ||
          info.height !== derivative.height
        ) {
          throw new Error("generated derivative metadata is inconsistent");
        }
        return { asset: derivative, bytes: data };
      }),
    );
    return { source, asset, derivatives };
  } catch {
    throw new ContractError(
      "BUILD_FAILED",
      `Responsive image generation failed: ${source.media.id}`,
      [{ path: recordPath, message: "cannot generate verified WebP derivatives" }],
    );
  }
}
