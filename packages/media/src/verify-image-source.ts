import { ContractError, type ContractIssue } from "@content-foundry/content-contract";
import sharp from "sharp";

import {
  type ImageMediaRecord,
  type VerifiedMediaBytes,
  verifyMediaByteIdentity,
} from "./verify-media-byte-identity.js";

export interface VerifiedImageSource extends VerifiedMediaBytes {
  readonly mimeType: string;
  readonly width: number;
  readonly height: number;
}

function failure(mediaId: string, issues: readonly ContractIssue[]) {
  return new ContractError(
    "INTEGRITY_FAILED",
    `Media image verification failed: ${mediaId}`,
    issues,
  );
}

export async function verifyImageSource(
  media: ImageMediaRecord,
  bytes: Uint8Array,
  recordPath: string,
): Promise<VerifiedImageSource> {
  const verified = verifyMediaByteIdentity(media, bytes, recordPath);
  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    metadata = await sharp(verified.bytes, { failOn: "error" }).metadata();
  } catch {
    throw failure(media.id, [
      { path: recordPath, message: "source bytes are not a decodable image" },
    ]);
  }

  const mimeType = metadata.mediaType ?? "unknown";
  const issues: ContractIssue[] = [];
  for (const [field, expected, actual] of [
    ["mimeType", media.mimeType, mimeType],
    ["width", media.width, metadata.width],
    ["height", media.height, metadata.height],
  ] as const) {
    if (actual !== expected) {
      issues.push({
        path: `${recordPath}/${field}`,
        message: `expected ${String(expected)}, got ${String(actual)}`,
      });
    }
  }
  if (issues.length > 0) throw failure(media.id, issues);

  return {
    ...verified,
    mimeType,
    width: metadata.width,
    height: metadata.height,
  };
}
