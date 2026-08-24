import { type MediaSourceReader } from "./read-bundle-media-source.js";
import {
  type VerifiedImageSource,
  verifyImageSource,
} from "./verify-image-source.js";
import { type ImageMediaRecord } from "./verify-media-byte-identity.js";

export type MediaSourceReaders = Readonly<
  Record<ImageMediaRecord["source"], MediaSourceReader>
>;

export async function resolveImageSource(
  media: ImageMediaRecord,
  readers: MediaSourceReaders,
  recordPath: string,
): Promise<VerifiedImageSource> {
  const bytes = await readers[media.source](media, recordPath);
  return verifyImageSource(media, bytes, recordPath);
}
