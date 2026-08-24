import { ContractError } from "@content-foundry/content-contract";

import { type MediaSourceReader } from "./read-bundle-media-source.js";

export type ImmutableObjectLoader = (
  key: string,
) => Promise<Uint8Array | null>;

export function createImmutableObjectMediaSourceReader(
  loadObject: ImmutableObjectLoader,
): MediaSourceReader {
  return async (media, recordPath) => {
    if (media.source !== "immutable-object") {
      throw new ContractError(
        "INTEGRITY_FAILED",
        `Immutable media source failed: ${media.id}`,
        [
          {
            path: `${recordPath}/source`,
            message: `expected immutable-object source, got ${media.source}`,
          },
        ],
      );
    }

    let bytes: Uint8Array | null;
    try {
      bytes = await loadObject(media.path);
    } catch {
      bytes = null;
    }
    if (bytes === null) {
      throw new ContractError(
        "INTEGRITY_FAILED",
        `Immutable media source failed: ${media.id}`,
        [{ path: `${recordPath}/path`, message: "immutable object is unavailable" }],
      );
    }
    return bytes;
  };
}
