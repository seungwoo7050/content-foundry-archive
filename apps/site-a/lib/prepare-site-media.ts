import type { LoadedSupportedReleaseBundle } from "@content-foundry/content-contract";
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

type SiteMediaBundle = Pick<LoadedSupportedReleaseBundle, "mediaManifest">;

export async function prepareSiteMedia(
  bundle: SiteMediaBundle,
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
