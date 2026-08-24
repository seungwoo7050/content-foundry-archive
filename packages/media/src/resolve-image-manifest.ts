import { type MediaManifestV3 } from "@content-foundry/content-contract";

import {
  type MediaSourceReaders,
  resolveImageSource,
} from "./resolve-image-source.js";
import { type VerifiedImageSource } from "./verify-image-source.js";

export async function resolveImageManifest(
  manifest: MediaManifestV3,
  readers: MediaSourceReaders,
): Promise<readonly VerifiedImageSource[]> {
  const verified: VerifiedImageSource[] = [];
  for (const [index, media] of manifest.items.entries()) {
    verified.push(
      await resolveImageSource(media, readers, `/media/items/${index}`),
    );
  }
  return verified;
}
