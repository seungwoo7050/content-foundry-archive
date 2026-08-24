import type { PublishedContentBlockV3 } from "@content-foundry/content-contract";

import type { ResponsiveImageAssetRegistry } from "../lib/responsive-image-asset-registry";

export type { ResponsiveImageAssetRegistry } from "../lib/responsive-image-asset-registry";

export type PublishedImageBlockV3 = Extract<
  PublishedContentBlockV3,
  { type: "image" }
>;
interface ImageBlockProps {
  readonly block: PublishedImageBlockV3;
  readonly assets: ResponsiveImageAssetRegistry;
}

export class MissingResponsiveImageAssetError extends Error {
  readonly code = "RESPONSIVE_IMAGE_ASSET_MISSING";

  constructor(readonly mediaId: string) {
    super(`Responsive image asset is missing: ${mediaId}`);
    this.name = "MissingResponsiveImageAssetError";
  }
}

export function ImageBlock({ block, assets }: ImageBlockProps) {
  const asset = assets.get(block.mediaId);
  if (asset === undefined) throw new MissingResponsiveImageAssetError(block.mediaId);
  const srcSet = asset.derivatives
    .map(({ publicPath, width }) => `${publicPath} ${width}w`)
    .join(", ");
  const details = [
    block.caption ?? null,
    asset.fallback.credit ? `출처: ${asset.fallback.credit}` : null,
    asset.fallback.license ? `이용 조건: ${asset.fallback.license}` : null,
  ].filter((detail): detail is string => detail !== null);

  return (
    <figure className="content-image">
      <picture>
        <source
          sizes="(min-width: 48rem) 42rem, 100vw"
          srcSet={srcSet}
          type="image/webp"
        />
        <img
          alt={asset.fallback.alt}
          decoding="async"
          height={asset.fallback.height}
          loading="lazy"
          src={asset.fallback.publicPath}
          width={asset.fallback.width}
        />
      </picture>
      {details.length > 0 ? (
        <figcaption>{details.map((detail) => <span key={detail}>{detail}</span>)}</figcaption>
      ) : null}
    </figure>
  );
}
