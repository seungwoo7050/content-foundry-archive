import { createHash } from "node:crypto";

import {
  ContractError,
  type ContractIssue,
  type MediaManifestV3,
} from "@content-foundry/content-contract";

export type ImageMediaRecord = MediaManifestV3["items"][number];

export interface VerifiedMediaBytes {
  readonly media: ImageMediaRecord;
  readonly bytes: Buffer;
}

export function verifyMediaByteIdentity(
  media: ImageMediaRecord,
  bytes: Uint8Array,
  recordPath: string,
): VerifiedMediaBytes {
  const source = Buffer.from(bytes);
  const actualHash = createHash("sha256").update(source).digest("hex");
  const issues: ContractIssue[] = [];

  if (source.byteLength !== media.bytes) {
    issues.push({
      path: `${recordPath}/bytes`,
      message: `expected ${media.bytes}, got ${source.byteLength}`,
    });
  }
  if (actualHash !== media.sha256) {
    issues.push({
      path: `${recordPath}/sha256`,
      message: `expected ${media.sha256}, got ${actualHash}`,
    });
  }
  if (issues.length > 0) {
    throw new ContractError(
      "INTEGRITY_FAILED",
      `Media byte identity failed: ${media.id}`,
      issues,
    );
  }
  return { media, bytes: source };
}
