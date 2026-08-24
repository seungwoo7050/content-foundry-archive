import { ContractError } from "@content-foundry/content-contract";

import { type ImageMediaRecord } from "./verify-media-byte-identity.js";

export interface ImageProjectionSource {
  readonly media: ImageMediaRecord;
  readonly mimeType: string;
  readonly width: number;
  readonly height: number;
}

const EXTENSIONS: Readonly<Record<string, string>> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface StaticImageAsset {
  readonly mediaId: string;
  readonly relativePath: string;
  readonly publicPath: string;
  readonly sha256: string;
  readonly mimeType: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly credit: string | null;
  readonly license: string | null;
}

export function projectStaticImageAsset(
  source: ImageProjectionSource,
  recordPath: string,
): StaticImageAsset {
  const extension = EXTENSIONS[source.mimeType];
  if (extension === undefined) {
    throw new ContractError(
      "BUILD_FAILED",
      `Unsupported public image MIME type: ${source.media.id}`,
      [
        {
          path: `${recordPath}/mimeType`,
          message: `cannot publish ${source.mimeType}`,
        },
      ],
    );
  }

  const relativePath = `_media/${source.media.sha256}/source.${extension}`;
  return {
    mediaId: source.media.id,
    relativePath,
    publicPath: `/${relativePath}`,
    sha256: source.media.sha256,
    mimeType: source.mimeType,
    width: source.width,
    height: source.height,
    alt: source.media.alt,
    credit: source.media.credit,
    license: source.media.license,
  };
}
