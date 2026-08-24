import type { LoadedReleaseBundleV3 } from "@content-foundry/content-contract";
import {
  createBundleMediaSourceReader,
  createImmutableObjectMediaSourceReader,
  exportResponsiveImageSources,
  type ImmutableObjectLoader,
  type ResponsiveImageAsset,
  resolveImageManifest,
} from "@content-foundry/media";

export interface PrepareSiteMediaOptions {
  readonly immutableObjectLoader: ImmutableObjectLoader;
  readonly publicDirectory: string;
  readonly releaseDirectory: string;
}

export async function prepareSiteMedia(
  bundle: LoadedReleaseBundleV3,
  options: PrepareSiteMediaOptions,
): Promise<ReadonlyMap<string, ResponsiveImageAsset>> {
  const sources = await resolveImageManifest(bundle.mediaManifest, {
    bundle: createBundleMediaSourceReader(options.releaseDirectory),
    "immutable-object": createImmutableObjectMediaSourceReader(
      options.immutableObjectLoader,
    ),
  });
  const assets = await exportResponsiveImageSources(
    sources,
    options.publicDirectory,
  );
  return new Map(assets.map((asset) => [asset.fallback.mediaId, asset]));
}
