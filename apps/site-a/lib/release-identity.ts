import type { LoadedReleaseBundle } from "@content-foundry/content-contract";
import type { Metadata } from "next";

export interface ReleaseIdentity {
  readonly releaseId: string;
  readonly siteId: string;
  readonly contractVersion: string;
  readonly bundleChecksum: string;
}

export function createReleaseIdentity(
  bundle: LoadedReleaseBundle,
): ReleaseIdentity {
  return {
    releaseId: bundle.release.releaseId,
    siteId: bundle.release.siteId,
    contractVersion: bundle.release.contractVersion,
    bundleChecksum: bundle.release.bundleChecksum,
  };
}

export function createReleaseIdentityMetadata(
  identity: ReleaseIdentity,
): NonNullable<Metadata["other"]> {
  return {
    "content-foundry-release-id": identity.releaseId,
    "content-foundry-site-id": identity.siteId,
    "content-foundry-contract-version": identity.contractVersion,
    "content-foundry-bundle-checksum": identity.bundleChecksum,
  };
}
